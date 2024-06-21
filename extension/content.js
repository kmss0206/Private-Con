function showLoading() {
    let loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loadingOverlay';
    loadingOverlay.style.position = 'fixed';
    loadingOverlay.style.top = 0;
    loadingOverlay.style.left = 0;
    loadingOverlay.style.width = '100%';
    loadingOverlay.style.height = '100%';
    loadingOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    loadingOverlay.style.zIndex = 10000;
    loadingOverlay.style.display = 'flex';
    loadingOverlay.style.justifyContent = 'center';
    loadingOverlay.style.alignItems = 'center';

    let loadingImage = document.createElement('img');
    loadingImage.src = chrome.runtime.getURL('icons/loading.png'); // 이미지 경로 설정
    loadingImage.style.width = '150px'; // 원하는 크기로 설정
    loadingImage.style.height = '150px';

    loadingOverlay.appendChild(loadingImage);
    document.body.appendChild(loadingOverlay);
}

function hideLoading() {
    let loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

function createIconContainer(item, iconPath) {
    let iconContainer = document.createElement('div');
    iconContainer.style.display = 'flex';
    iconContainer.style.flexDirection = 'column';
    iconContainer.style.alignItems = 'center';
    iconContainer.style.margin = '10px';

    let icon = document.createElement('img');
    icon.src = chrome.runtime.getURL('icons/' + iconPath);
    icon.style.width = '48px';
    icon.style.height = '48px';
    // 글씨랑 아이콘 사이 벌어짐
    icon.style.marginBottom = '7px';

    let label = document.createElement('div');
    label.textContent = item;
    label.style.fontSize = '16px';
    //여기가 사진 밑에 글씨다
    label.style.color = '#333';
    label.style.fontWeight = 'bold';
    iconContainer.appendChild(icon);
    iconContainer.appendChild(label);

    return iconContainer;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "showLoading") {
        showLoading();
        sendResponse({ status: 'loading shown' });
    } else if (request.action === "hideLoading") {
        hideLoading();
        sendResponse({ status: 'loading hidden' });
    } else if (request.action === "injectText") {
        hideLoading(); // 로딩 화면을 숨깁니다.

        // 오버레이 생성
        let overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.left = '0';
        overlay.style.top = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        overlay.style.zIndex = '10000';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';

        // 컨테이너 생성
        let container = document.createElement('div');
        container.style.backgroundColor = 'white';
        container.style.border = '1px solid black';
        container.style.padding = '20px';
        container.style.width = '440px';
        container.style.height = '310px';
        container.style.overflowY = 'auto';
        container.style.display = 'flex';
        container.style.flexWrap = 'wrap';
        container.style.justifyContent = 'center';
        container.style.borderRadius = '10px';

        let header = document.createElement('div');

        header.style.fontSize = '22px';
        header.style.fontWeight = 'bold';
        header.style.marginBottom = '20px';
        header.style.textAlign = 'center';
        header.style.color = '#000000';
        header.innerHTML = '이 웹사이트가 <span style="color: red;">수집하는</span> 당신의 <span style="color: red;">개인정보</span> 입니다.';
        container.appendChild(header);

        const icons = {
            '아이디': '아이디.png',
            '비밀번호': '비밀번호.png',
            '이메일': '이메일.png',
            '이름': '이름.png',
            '프로필사진': '프로필사진.png',
            '생년월일': '생년월일.png',
            '전화번호': '전화번호.png',
            'IP': 'IP.png',
            '위치정보': '위치정보.png',
            '접속기록': '접속기록.png',
            '기기정보': '기기정보.png'
        };

        const redIconsOrder = ['프로필사진', '전화번호', '접속기록'];
        const otherIconsOrder = Object.keys(icons).filter(item => !redIconsOrder.includes(item));

        redIconsOrder.forEach(item => {
            if (icons[item] && request.data.includes(item)) {
                let iconContainer = createIconContainer(item, icons[item]);
                container.appendChild(iconContainer);
            }
        });

        otherIconsOrder.forEach(item => {
            if (icons[item] && request.data.includes(item)) {
                let iconContainer = createIconContainer(item, icons[item]);
                container.appendChild(iconContainer);
            }
        });

        let footerContainer = document.createElement('div');
        footerContainer.style.display = 'flex';
        footerContainer.style.flexDirection = 'column';
        footerContainer.style.alignItems = 'center';
        footerContainer.style.width = '100%';
        footerContainer.style.marginTop = '20px';

        let confirmButton = document.createElement('button');
        confirmButton.textContent = '닫기';
        confirmButton.style.padding = '10px 120px';
        confirmButton.style.backgroundColor = '#87CEFA'; //#87CEFA
        confirmButton.style.color = 'white';
        confirmButton.style.border = 'none';
        confirmButton.style.borderRadius = '5px';
        confirmButton.style.cursor = 'pointer';
        confirmButton.style.fontSize = '16px';
        confirmButton.style.fontWeight = 'bold';
        confirmButton.style.transition = 'background-color 0.3s';
        confirmButton.addEventListener('mouseover', function() {
            this.style.backgroundColor = '#6495ED';
        });
        confirmButton.addEventListener('mouseout', function() {
            this.style.backgroundColor = '#87CEFA';
        });
        confirmButton.addEventListener('click', function() {
            overlay.remove();
        });



        footerContainer.appendChild(confirmButton);
        container.appendChild(footerContainer);
        overlay.appendChild(container);
        document.body.appendChild(overlay);

        sendResponse({status: 'success'});
    }
    return true;
});
