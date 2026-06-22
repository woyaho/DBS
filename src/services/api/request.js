// 通用请求工具函数

const API_BASE_URL = '/api';

export async function request(url, options = {}) {
  const headers = {};

  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !(options.body instanceof URLSearchParams)) {
    headers['Content-Type'] = 'application/json';
  }

  let finalUrl = url;
  if (options.params) {
    const searchParams = new URLSearchParams(options.params);
    finalUrl = `${url}?${searchParams.toString()}`;
  }

  const fullUrl = `${API_BASE_URL}${finalUrl}`;
  console.log(`[REQUEST] ${options.method || 'GET'} ${fullUrl}`);
  console.log(`[REQUEST] Headers:`, JSON.stringify(headers));
  if (options.body) {
    console.log(`[REQUEST] Body:`, options.body);
  }

  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    },
    credentials: 'include',
    mode: 'cors',
    redirect: 'follow'
  });

  console.log(`[RESPONSE] Status: ${response.status} for ${fullUrl}`);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} for ${fullUrl}`);
  }

  // 根据 responseType 返回不同类型的响应
  if (options.responseType === 'blob') {
    return response.blob().then(blob => {
      if (blob.type === 'application/json' || blob.type === 'text/plain') {
        return new Response(blob).json().then(json => {
          throw new Error(json.message || '请求失败');
        });
      }
      return blob;
    });
  } else if (options.responseType === 'text') {
    return response.text();
  }

  return response.json();
}

// 通用文件上传请求函数
export async function uploadRequest(url, formData) {
  const headers = {};
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fullUrl = `${API_BASE_URL}${url}`;
  console.log(`[UPLOAD REQUEST] POST ${fullUrl}`);
  console.log(`[UPLOAD REQUEST] Headers:`, JSON.stringify(headers));
  
  // 打印 FormData 的内容
  for (const [key, value] of formData.entries()) {
    console.log(`[UPLOAD REQUEST] FormData ${key}:`, value instanceof File ? `File(${value.name}, ${value.size})` : value);
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'POST',
    headers: headers,
    body: formData,
    credentials: 'include',
    mode: 'cors',
    redirect: 'follow'
  });

  console.log(`[UPLOAD RESPONSE] Status: ${response.status} for ${fullUrl}`);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}
