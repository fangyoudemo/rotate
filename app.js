//app.js
var md5 = require('utils/md5.js')
var wxTools = require('utils/wxTools.js')
var loginInfo = {};

App({
  setConfig: {
    url: 'https://mp.mlbrgw.com',
    hb_appid: 'hb_wzwd123',
    hb_appsecret: 'MXWDh0mzTfreeoE6ffe123'
  },
  onLaunch: function () {
    var that = this;
    
  },
  onShow: function (options){
    this.onShareTicket(options)
    //判断用户是否已经授权获取用户信息
    this.isAuthUserInfo(null);
  },

  globalData: {
    userInfo: null,
    token: '',
    timer: null,
    excAmount: null,  //可兑换的挑战次数
    revive_money: null,  //复活卡金额
    toAdvs: true,
    title: '究竟谁是答题王, 等你来挑战! !',
    iv:'',
    encryptedData:'',
    getinfo: false,
    code:'',
    isAuthUserInfo:false
  },
  getSign: function () {
    var timestamp = Math.round(new Date().getTime() / 1000);
    var sign = md5.md5(this.setConfig.hb_appid + this.setConfig.hb_appsecret + timestamp);
    sign = md5.md5(sign + this.setConfig.hb_appsecret);
    return { appid: this.setConfig.hb_appid, timestamp: timestamp, sign: sign };
  },
  //判断是否已经授权获取用户信息
  isAuthUserInfo: function (page){
    var that = this;
    // console.log(page);
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          this.globalData.getinfo = true;
          if(page)return true;
          that.userLogin();
        }else{
          this.globalData.getinfo = false;
          if (page){
            wx.hideLoading();
            console.log('显示授权');
            page.setData({
              showGetinfo: true
            });
          }
        }
      }
    });
  },
  //登录
  userLogin: function () {
      console.log(this.globalData.token);
    if (this.globalData.token){
      return false;
    }
    var that = this;
    

//判断用户是否已经授权获取用户信息 end
    wx.getUserInfo({
      success: res => {
        //   console.log(res);
        // 可以将 res 发送给后台解码出 unionId
        var infoUser = '';
        that.globalData.userInfo = res;
        //用户信息入库
        that.login(res, "", this)
      }
    })
  
  },

  login:function(res,callback,page){
      console.log("登录..");
    var that = this;

    var infoUser = res.userInfo;
    console.log(infoUser);
    console.log(that.globalData.userInfo);
    that.globalData.userInfo = res.userInfo;
    var url = that.setConfig.url + '/index.php?g=User&m=login&a=dologin';
    //获取登录code
    wx.login({
      success: function (res) {
        console.log(res.code);
        if (res.code) {
          var data = {
            user_name: infoUser.nickName,
            nick_name: infoUser.nickName,
            head_img: infoUser.avatarUrl,
            sex: infoUser.gender,
            coutry: infoUser.country,
            city: infoUser.city,
            province: infoUser.province,
            code: res.code,
            encryptedData: that.globalData.userInfo.encryptedData,
            iv: that.globalData.userInfo.iv,
          }
          if (callback) callback();         
          that.request(url, data,(res) => {   
            //   console.log("成功")            
            if (res.data.code != 20000) {
              wx.showToast({
                title: res.data.msg,
                icon: 'loading',
                mask: true,
                duration: 1500
              })
              if (res.data.code == 40500) {
                wx.showToast({
                  title: res.data.msg,
                  icon: 'loading',
                  mask: true,
                  duration: 1500
                })
              }
              return false;
            }
            if (res.data.token) {
              that.globalData.token = res.data.token;
              if (that.tokenReadyCallback) {
                console.log('tokenReadyCallback')
                that.tokenReadyCallback();
              }
              // 所以此处加入 callback 以防止这种情况 获取慢
              if (that.userInfoReadyCallback) {
                console.log('userInfoReadyCallback')
                that.userInfoReadyCallback(res)
              }
            
            }
          }, that);
        }
      }
    })
    
     
  },
  request: function (url, data, cb, page){
    var signData = this.getSign();
    data.sign = signData.sign;
    data.timestamp = signData.timestamp;
    wxTools.wxRequest({url: url, data: data, method: 'post'}, cb, page, 0);
  },
  //提交
  postLogin: function (url, data, callback = function () { }) {
    var that = this;
    var signData = this.getSign();
    data.sign = signData.sign;
    data.timestamp = signData.timestamp;
    //发起网络请求
    wx.request({
      url: url,
      data: data,
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: function (res) {
        if (res.data.code != 20000) {
          wx.showToast({
            title: res.data.msg,
            icon: 'loading',
            mask: true,
            duration: 1500
          })
          if (res.data.code == 40500) { callback(res); }
          return false;
        }
        if (res.data.token) {
          that.globalData.token = res.data.token;
          if (that.tokenReadyCallback) {
            that.tokenReadyCallback();
          }
        }
        //console.log(that.globalData)
        callback(res);

      }
    })
  },
  onShareTicket: function (options) {
    console.log("shareTicket: "+options.shareTicket);
    var that = this;
    // console.log('111:'+options)
    // console.log(options)
    if (options.shareTicket) {
      var shareTickets = options.shareTicket
      wx.getShareInfo({
        shareTicket: shareTickets,
        success: function (res) { //是群聊
          that.globalData.encryptedData = res.encryptedData;
          that.globalData.iv = res.iv;
          if (that.allDataReadyCallback && that.globalData.token){
            console.log('onShareTicket.allDataReadyCallback')
            that.allDataReadyCallback();
          }
        }
      })

    }

  }
})
