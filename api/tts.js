export default async function handler(req, res) {
  // 1. 设置允许跨域头，防止前端页面被跨域阻止
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { text } = req.query;
  if (!text) {
    return res.status(400).send('缺少 text 参数');
  }

  try {
    const encoded = encodeURIComponent(text);
    // 2. 核心修改：改为 Google 香港 TTS 节点
    const googleHkUrl = `https://translate.google.com.hk/translate_tts?ie=UTF-8&tl=th&client=tw-ob&q=${encoded}`;

    const response = await fetch(googleHkUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com.hk/'
      }
    });

    if (!response.ok) {
      return res.status(response.status).send(`Google HK TTS 请求失败: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    
    // 3. 设置音频流返回头，支持浏览器直接播放与缓存
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 缓存24小时，减少重复调用
    return res.send(Buffer.from(audioBuffer));
  } catch (error) {
    return res.status(500).send(`服务器代理异常: ${error.message}`);
  }
}
