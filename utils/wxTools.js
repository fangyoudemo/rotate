function wxRequest(obj, cb, page, type) {
  
  var page = page;
  var isOne = true
  var cachFn = function () {
    wx.request({
      url: obj.url,
      data: obj.data || {},
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      method: obj.method || 'GET',
      success: function (res) {
        // console.log(res)
        cb.call(page, res)
        
        if (page.data && !page.data.isNet) {
          page.setData({
            isNet: true
          })
        }
      },
      // fail执行时当断网处理
      fail: function () {
        var pages = getCurrentPages() //获取加载的页面

        var currentPage = pages[pages.length - 1] //获取当前页面的对象
        page = currentPage;
        var url = currentPage.route //当前页面url

        console.log(url)
        // console.log(obj)
        wx.hideLoading()
        // 防止fail 有时会执行两次，影响渲染
        if (!isOne) {
          return
        }

        if (page.data){
          if (page.clearpop) {
            page.clearpop()
            // page.setData({
            //   percent:0
            // })
          }
          page.setData({
            isNet: false,
            isRequested: false,
            overdue: true,  //请求超时弹框是否显示
          })
        }
        
        
        // 记录本次请求，加载时，执行page实例的reloadFn即可
        page.reloadFn = wxRequest(obj, cb, page, 1)
        isOne = false
      }
    })
  }

  if (type) {
    page.isRequested = true
  }

  return type ? cachFn : cachFn()
}

module.exports.wxRequest = wxRequest