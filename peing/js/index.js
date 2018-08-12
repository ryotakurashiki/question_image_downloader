'use strict';

(function(){
  // 質問画像が表示されるページをiframeで開く
  const openIframe = function(event){
    var url = event.target.dataset.url;
    var formattedDate = event.target.dataset.formatteddate;
    var question = {url: url, formattedDate: formattedDate }
    // iframeを生成
    var iframe = document.createElement("iframe");
    iframe.name = "imageDownloaderIframe";
    iframe.src = url;
    iframe.width = "1px";
    iframe.height = "1px";
    iframe.onload = function(){
      // iframeのロードが完了したら画像のURLを取得
      if(iframe.contentWindow.document.body.children.length == 0) return;
      var imageUrl = iframe.contentWindow.document.querySelector('h1 > a > img').getAttribute('src');
      // 画像をダウンロードする
      chrome.runtime.sendMessage({ functionName: 'downloadImage', imageUrl: imageUrl, question: question }, function(response){});
      // iframeを除去
      document.body.removeChild(iframe);
      // テキストを変更
      event.target.childNodes[1].textContent = "画像ダウンロード(済み）"
    };
    document.body.appendChild(iframe);
  }

  // ダウンロードボタンを置く
  var createDownloadLink = function(url, formattedDate, alreadyDownloaded){
    var a = document.createElement("a");
    a.href = "javascript:void(0)"
    a.setAttribute("data-url", url);
    a.setAttribute("data-formatteddate", formattedDate);
    a.addEventListener( "click" , openIframe , false );
    // アイコンを追加
    var i = document.createElement("i");
    i.setAttribute("class", "fa fa-download");
    a.appendChild(i);
    // テキストノードを追加
    var text = alreadyDownloaded ? "画像ダウンロード(済)" : "画像ダウンロード"
    var textNode = document.createTextNode(text);
    a.appendChild(textNode);
    return a;
  }

  // 月/日を年月日に変換する
  var createFormattedDate = function(dateText) {
    var array = dateText.split('/');
    var currentMonth = new Date().getMonth() + 1;
    var currentYear = new Date().getFullYear();
    var year = currentMonth >= array[0] ? currentYear : currentYear - 1;
    var array = array.map(function(a){ return ("0" + a).slice(-2); });
    return String(year) + array.join("");
  }

  chrome.runtime.sendMessage( { functionName: 'getDownloadedUrls' }, function(res){
    var donwloadedUrls = res.donwloadedUrls;
    var question_boxes = $('div.question-box');
    question_boxes.each(function(i, q) {
      var url = $(q).find('a.link').prop('href');
      var dateText = $(q).find('div.date span')[0].innerText;
      var formattedDate = createFormattedDate(dateText)
      var alreadyDownloaded = donwloadedUrls.indexOf(url) != -1;
      var a = createDownloadLink(url, formattedDate, alreadyDownloaded)
      $(q).find('div.remove').append(a)
    });
  })

})();
