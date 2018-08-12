'use strict';

(function(){
  // 質問画像が表示されるページをiframeで開く
  const openIframe = function(event){
    event.preventDefault();
    var url = event.currentTarget.dataset.url;
    var question = {url: url}
    // iframeを生成
    var iframe = document.createElement("iframe");
    iframe.name = "imageDownloaderIframe";
    iframe.src = url;
    iframe.width = "1px";
    iframe.height = "1px";
    iframe.onload = function(){
      // iframeのロードが完了したら画像のURLを取得
      if(iframe.contentWindow.document.body.children.length == 0) return;
      var imageUrl = iframe.contentWindow.document.querySelector('body > main > div.card > img').getAttribute('src');
      // 画像をダウンロードする
      chrome.runtime.sendMessage({ functionName: 'downloadImage', imageUrl: imageUrl, question: question }, function(response){});
      // iframeを除去
      document.body.removeChild(iframe);
      // ダウンロードボタンの色を変える
      event.target.style.color = "#666";
    };
    document.body.appendChild(iframe);
  }

  // ダウンロードボタンを置く
  var createDownloadLink = function(url, alreadyDownloaded){
    var a = document.createElement("a");
    a.href = "javascript:void(0)"
    a.setAttribute("data-url", url);
    a.setAttribute("class", "block-message");
    a.setAttribute("title", "画像ダウンロード");
    if (alreadyDownloaded) a.style.color = "#666";
    a.addEventListener( "click" , openIframe , false );
    // アイコンを追加
    var i = document.createElement("i");
    i.setAttribute("class", "fa fa-lg fa-download");
    a.appendChild(i);
    var li = document.createElement("li");
    li.setAttribute("style", "margin-left: 1.5em");
    li.appendChild(a)
    return li;
  }

  displayDownloadIcon();

  var href = location.href;
  // ページ移動でjsがリロードされずDOMとURLだけ変わるので
  var observer = new MutationObserver(function(mutations) {
    console.log(location.href)
    if(href !== location.href) {
      // 遅延がないと表示されないことがあるので
      setTimeout(function(){
        displayDownloadIcon();
      }, 500);
      href = location.href;
    }
  });
  observer.observe(document, { childList: true, subtree: true });


  // ダウンロードアイコンを表示する
  function displayDownloadIcon() {
    chrome.runtime.sendMessage( { functionName: 'getDownloadedUrls' }, function(res){
      var donwloadedUrls = res.donwloadedUrls;
      var question_boxes = $('li.list-group-item.message[data-controller="message"]');
      question_boxes.each(function(i, q) {
        var url = $(q).find('div div div a').prop('href');
        var alreadyDownloaded = donwloadedUrls.indexOf(url) != -1;
        var li = createDownloadLink(url, alreadyDownloaded)
        $(q).find('ul li:last-child').before(li)
      });
    })
  }

})();
