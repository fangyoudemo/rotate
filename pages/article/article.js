// pages/article/article.js
var WxParse = require('../../wxParse/wxParse.js');
Page({
  data: {
      
      title:''
  },
  onLoad: function (options) {
    //   console.log(options)
      let id= options.id
      wx.request({
          url: `https://mp.mlbrgw.com/Api/AdminPage/getContent?id=${id}`,
          method: 'GET',
          success:res=>{
            this.setData({
                article:res.data.text,
                title:res.data.title
            })
            var temp = WxParse.wxParse('article', 'html', this.data.article, this, 0);
            this.setData({
                article: temp
            })  
            wx.setNavigationBarTitle({
                title: this.data.title
            })
          }
      })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})