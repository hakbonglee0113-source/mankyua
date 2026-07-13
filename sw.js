// 제주고사리삼 조사야장 - 서비스워커 (오프라인 캐싱)
// 앱 내용을 바꿔 다시 배포할 때는 아래 CACHE_NAME 뒤 숫자(v1, v2...)를 반드시 올려주세요.
// 그래야 사용자가 다음에 인터넷이 연결됐을 때 새 버전을 받아갑니다.
var CACHE_NAME = "jeju-gosarisam-cache-v11";
var ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(ASSETS);
    }).then(function(){
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE_NAME; })
            .map(function(k){ return caches.delete(k); })
      );
    }).then(function(){
      return self.clients.claim();
    })
  );
});

// 캐시 우선(cache-first) 전략: 오프라인에서도 항상 앱이 열리도록 함
self.addEventListener("fetch", function(event){
  if(event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(function(cached){
      if(cached) return cached;
      return fetch(event.request).then(function(resp){
        return caches.open(CACHE_NAME).then(function(cache){
          try{ cache.put(event.request, resp.clone()); }catch(e){}
          return resp;
        });
      }).catch(function(){
        // 오프라인이고 캐시에도 없으면 최소한 메인 페이지라도 반환
        return caches.match("./index.html");
      });
    })
  );
});
