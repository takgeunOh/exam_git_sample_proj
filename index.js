// 작성자 : 오탁근
// email : takgeun92@gmail.com
// write day : 2022-05-27

const http = require('http');
const express = require('express');
const app = express();

// 파일 입출력
const fs = require('fs');

// axios, cheerio, fs 3가지 모듈을 이용하여 크롤링할 것.
// 크롤링
const axios = require('axios');
const cheerio = require('cheerio');

// axios 한글 깨짐 해결하는 모듈
const iconv = require('iconv-lite');
const { syncBuiltinESMExports } = require('module');

const sleep = (ms) => {
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

app.get('/axios', (req, res) => {
    // Promise - 콜백 헬에 빠지는것을 방지(흐름제어) - 메소드체인.then([콜백])
    // Async - 리스트 형식으로 한다. [콜백, 콜백, 콜백 ...]
    let getUrlVal = "https://news.naver.com/main/main.naver?mode=LSD&mid=shm&sid1=100";
    axios.get(getUrlVal, {responseType:"arraybuffer"}).then(async(response) => {
        const htmlContent = response.data;
        let htmlCMD = iconv.decode(htmlContent,"EUC-KR").toString();
        // cheerio를 이용한 DOM셀렉터
        const $ = cheerio.load(htmlCMD);
        //#main_content > div > div._persist > div:nth-child(1) > div:nth-child(4) > div.cluster_body > ul > li:nth-child(1) > div.cluster_thumb > div > a > img
        let imgData = $('ul > li > div.cluster_thumb > div > a > img');
        for(var i=0, cnt=0; i<10; i++) {
            let imgUrl = imgData[i].attribs.src
            //console.log(imgUrl.split('?')[0]);
            let imgDataUrl = imgUrl.split('?')[0];
            //console.log(imgDataUrl);
            axios.get(imgDataUrl, {responseType: 'arraybuffer'}).then( (imgRes)=>{
                //console.log(imgRes.data);
                fs.writeFile("./download/"+cnt+".jpg", imgRes.data, (err, data1)=>{
                    console.log(">>> 다운로드 완료 " + cnt++);
                });
            });
            await sleep(1000);
        }
    });
    res.end();
});


app.get('/axios_test2', (req, res) => {
    // promise : 비동기가 많아지면 callback을 계속 쓰게 되는데 이럴 때 흐름 제어를 해줘야한다.
    // callback을 계속 썼을 때 발생하는 현상(콜백헬)에 빠지는 것을 방지해준다.
    // 메소드체인처럼 생겼는데 메소드체인.then([콜백]) 이런 형태로 들어간다.
    // 반면 Async라는 것도 있는데 이것은 리스트 형식으로 한다. [콜백, 콜백, 콜백, ...]
    // 이렇게 2가지 형태가 있는데 일반적으로 Async가 쓰기 편할 것. promise는 표준임.
    // axios는 promise 형태이기 때문에 primose를 쓸 것

    // 네이버 주소를 get한 것.
    // 다른 거의 경우는 콜백함수를 넣는데 얘는 promise형식이기 때문에 .then()을 쓴다.
    let getUrlVal = "https://news.naver.com/main/main.naver?mode=LSD&mid=shm&sid1=100";
    axios.get(getUrlVal, {responseType:"arraybuffer"}).then((response) => {                            // 이 때의 response는 axios로 네이버를 요청하고 그 결과값이 넘어온 것을 말함.
        // console.log(response.data);             // 우리가 필요한 부분인 data 부분만 찍어보자.
        // const htmlContent = response.data;          // response.data는 결국은 html 내용이니까 htmlContent에 저장
        const htmlContent = response.data;
        let htmlCMD = iconv.decode(response.data, "EUC-KR").toString();        // 원래는 위 코드처럼 해야하지만 한글 깨짐을 해결하기 위해 이와 같이 코딩

        // cheerio를 이용한 DOM 셀렉터
        const $ = cheerio.load(htmlCMD);            // 여기까지 하면 이제 jQuery처럼 사용할 수 있게 된다.
        // #main_content > div > div._persist > div:nth-child(1) > div:nth-child(2) > div.cluster_body > ul > li:nth-child(1) > div.cluster_text > a

        // 네이버 뉴스 헤드라인 제목을 copy selector -> #main_content > div > div._persist > div:nth-child(1) > div:nth-child(2) > div.cluster_body
        // let h1Data = $('div.cluster_body').text();                    // h1 태그에 있는 text 내용이 저장된다.
        let h1Data = $('div.cluster_body div.cluster_text > a').text();         // 띄어쓰기만 하면 자손들이고, > 쓰면 직계자손
        console.log(h1Data.trim());
    });

    res.end();              // 요청을 안하면 계속 무한루프가 돈다. 따라서 end()를 써서 끝내줄 필요가 있다.
});

app.get('/readFile', (req, res) => {
    // 파일 읽기
    fs.readFile('./package.json', (err, data)=>{
        if(err) throw err;
        res.end(data);
        console.log(data);
        console.log(data.toString());
    });
});


const server = http.createServer(app);
server.listen(3000, ()=>{
    console.log('run on server - http://localhost:3000');
});