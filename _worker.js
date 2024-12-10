export default {
	async fetch(request, env, ctx) {
		
		let url = new URL(request.url);
		const 访问路径 = url.pathname;
		const 访问参数 = url.search;
	  
		let 后端域名 = [
			'www.baidu.com',
			'www.sogou.com',
			'www.so.com'
		];
		
		if(env.HOST) 后端域名 = await ADD(env.HOST);

		let 测试路径 = env.PATH || '/';
		
		if (测试路径.charAt(0) !== '/') 测试路径 = '/' + 测试路径;
		let 响应代码 = env.CODE || '200';
		
		console.log(`后端数量: ${后端域名.length}\n后端域名: ${后端域名}\n测试路径: ${测试路径}\n响应代码: ${响应代码}`);

		let 失效后端 = [];

		async function fetchWithTimeout(resource, options = {}) {
			const { timeout = 1618 } = options;
			
			const controller = new AbortController();
			const id = setTimeout(() => controller.abort(), timeout);
			
			const response = await fetch(resource, {
				...options,
				signal: controller.signal
			}).finally(() => clearTimeout(id));
			
			return response;
		}

		async function getValidResponse(request, 后端域名) {
			
			while (后端域名.length > 0) {
				
				const 随机后端 = 后端域名[Math.floor(Math.random() * 后端域名.length)];
				
				后端域名 = 后端域名.filter(host => host !== 随机后端);

				url.hostname = 随机后端;
				url.pathname = 测试路径.split('?')[0];
				url.search = 测试路径.split('?')[1] == "" ? "" : "?" + 测试路径.split('?')[1] ;
				try {
				
					const response = await fetchWithTimeout(new Request(url), { timeout: 1618 });
					
					if (response.status.toString() == 响应代码) {
						if (访问路径 != '/') url.pathname = 访问路径;
						console.log(`使用后端: ${url.hostname}`);
						
						console.log(`待选后端: ${后端域名}`);
						url.search = 访问参数;
						return await fetch(new Request(url, request));
					} else {
						console.log(`失效后端: ${url.hostname}:${response.status}`);
					}
				} catch (error) {
					
					失效后端.push(随机后端);
				}
			}
			
			return new Response('所有后端都不可用！', {
				status: 404,
				headers: { 'content-type': 'text/plain; charset=utf-8' },
				});
			
		}

		
		return await getValidResponse(request, 后端域名);
	}
}

async function ADD(envadd) {
	
	var addtext = envadd.replace(/[	 |"'\r\n]+/g, ',').replace(/,+/g, ',');
	
	if (addtext.charAt(0) == ',') addtext = addtext.slice(1);
	if (addtext.charAt(addtext.length - 1) == ',') addtext = addtext.slice(0, addtext.length - 1);
	
	const add = addtext.split(',');
	
	return add;
}
