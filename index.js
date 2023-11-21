const express = require("express");
const app = express();
const { exec, execSync } = require('child_process');
const port = process.env.PORT || 7860;
const UUID = process.env.UUID || 'lo04add9-5c68-8bab-870c-08cd5320df62'; 
const NEZHA_SERVER = process.env.NEZHA_SERVER || 'nz.f4i.cn';
const NEZHA_PORT = process.env.NEZHA_PORT || '5555';
const NEZHA_KEY = process.env.NEZHA_KEY || '8PolljppbavSr6pLSD';
const ARGO_DOMAIN = process.env.ARGO_DOMAIN || 'cdn8.chuyi.link';
const CFIP = process.env.CFIP || 'skk.moe';
const NAME = process.env.NAME || 'Huggingface';

// 根路由
app.get("/", function(req, res) {
  res.send("hello world");
});

const metaInfo = execSync(
  'curl -s https://speed.cloudflare.com/meta | awk -F\\" \'{print $26"-"$18}\' | sed -e \'s/ /_/g\'',
  { encoding: 'utf-8' }
);
const ISP = metaInfo.trim();

//sub订阅路由
app.get('/sub', (req, res) => {
  const VMESS = { v: '2', ps: `${NAME}-${ISP}`, add: CFIP, port: '443', id: UUID, aid: '0', scy: 'none', net: 'ws', type: 'none', host: ARGO_DOMAIN, path: '/vmess?ed=2048', tls: 'tls', sni: ARGO_DOMAIN, alpn: '' };
  const vlessURL = `vless://${UUID}@${CFIP}:443?encryption=none&security=tls&sni=${ARGO_DOMAIN}&type=ws&host=${ARGO_DOMAIN}&path=%2Fvless?ed=2048#${NAME}-${ISP}`;
  const vmessURL = `vmess://${Buffer.from(JSON.stringify(VMESS)).toString('base64')}`;
  const trojanURL = `trojan://${UUID}@${CFIP}:443?security=tls&sni=${ARGO_DOMAIN}&type=ws&host=${ARGO_DOMAIN}&path=%2Ftrojan?ed=2048#${NAME}-${ISP}`;
  
  const base64Content = Buffer.from(`${vlessURL}\n\n${vmessURL}\n\n${trojanURL}`).toString('base64');

  res.type('text/plain; charset=utf-8').send(base64Content);
});



// 运行 ne-zha
let NEZHA_TLS = '';
if (NEZHA_SERVER && NEZHA_PORT && NEZHA_KEY) {
  if (NEZHA_PORT === '443') {
    NEZHA_TLS = '--tls';
  }
  const command = `./swith -s ${NEZHA_SERVER}:${NEZHA_PORT} -p ${NEZHA_KEY} ${NEZHA_TLS} >/dev/null 2>&1 &`;
  try {
    exec(command);
    console.log('swith is running');

    // 等待2秒后执行下一个命令
    setTimeout(() => {
      runWeb();
    }, 2000);
  } catch (error) {
    console.error(`swith running error: ${error}`);
  }
} else {
  console.log('NEZHA variable is empty, skip running');
}

// 运行 xr-ay
function runWeb() {
  const command1 = `./web -c ./config.json >/dev/null 2>&1 &`;
  exec(command1, (error) => {
    if (error) {
      console.error(`web running error: ${error}`);
    } else {
      console.log('web is running');

      // 等待2秒后执行下一个命令
      setTimeout(() => {
        runServer();
      }, 2000);
    }
  });
}

// 运行 server
function runServer() {
  const command2 = `./server tunnel --edge-ip-version auto --config tunnel.yml run >/dev/null 2>&1 &`;
  exec(command2, (error) => {
    if (error) {
      console.error(`server running error: ${error}`);
    } else {
      console.log('server is running');
    }
  });
}


app.listen(port, () => console.log(`Server is listening on port ${port}!`));