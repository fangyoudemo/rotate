//adv.js
Page({
  data: {
    adv_url:'',
  },
  
  onLoad: function (options) {
    var that = this;
    var url = wx.getStorageSync('advertiseUrl')
    that.setData({
      adv_url:url
    })
  }
})