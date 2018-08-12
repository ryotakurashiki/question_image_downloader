'use strict';

(function(){
  // ダウンロードする画像の拡張子
  var IMAGE_EXTENSION = ".jpg";
  // ダウンロードした画像が表示されているページのURLリスト
  var donwloadedUrls = [];

  ///////////////////////////////
  // getDownloadedUrls
  ///////////////////////////////
  // 過去にダウンロードしたことのある画像が表示されているページのURLリストを取得する
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.functionName != "getDownloadedUrls") return;
    sendResponse({ donwloadedUrls: donwloadedUrls });
  });

  ///////////////////////////////
  // downloadImages
  ///////////////////////////////
  // 指定されたURLの画像をDLする
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.functionName != "downloadImage") return;
    var imageUrl = request.imageUrl;
    var id = getIdFromImageUrl(imageUrl);
    var url = request.question.url
    var formattedDate = request.question.formattedDate != undefined ? request.question.formattedDate : ""
    var filename = "質問画像_"
    if (request.question.formattedDate != undefined) {
      filename += formattedDate + "_" + id + IMAGE_EXTENSION;
    } else {
      filename += id + IMAGE_EXTENSION;
    }
    chrome.downloads.download({
      url: imageUrl,
      filename: filename
    });
    // ダウンロードが完了した質問のURLリストに追加
    donwloadedUrls.push(url)
  });

  function getIdFromImageUrl(imageUrl) {
    var array = imageUrl.split('/');
    var id = array[array.length-1].replace(/\.(jpg|png|jpeg|gif)/, "");
    return id;
  }

})();
