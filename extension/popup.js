document.addEventListener('DOMContentLoaded', function () {
    let button = document.getElementById('extract');
    let stopButton = document.getElementById('stop');

    // 저장된 버튼 상태를 가져옴
    chrome.storage.local.get(['buttonState'], function(result) {
        if (result.buttonState) {
            button.textContent = result.buttonState;
            if (result.buttonState === '작동중') {
                stopButton.style.display = 'inline';
            }
        } else {
            button.textContent = '시작';
            stopButton.style.display = 'none';
        }
    });

    button.addEventListener('click', function () {
        button.textContent = '작동중'; // 버튼 텍스트 변경
        chrome.storage.local.set({ buttonState: '작동중' });
        stopButton.style.display = 'inline'; // 끄기 버튼 표시

        // 백그라운드 스크립트가 실행되도록 함
        chrome.runtime.sendMessage({ action: 'startMonitoring' }, function(response) {
            console.log(response.status);
        });
    });

    stopButton.addEventListener('click', function () {
        button.textContent = '시작'; // 버튼 텍스트 초기화
        chrome.storage.local.set({ buttonState: '시작' });
        stopButton.style.display = 'none'; // 끄기 버튼 숨기기

        // 백그라운드 스크립트에 모니터링 중지 메시지 전송
        chrome.runtime.sendMessage({ action: 'stopMonitoring' }, function(response) {
            console.log(response.status);
        });
    });
});
