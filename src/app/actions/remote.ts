"use server";

import axios, { AxiosProgressEvent, AxiosResponse } from "axios";
import { v4 as uuidv4 } from "uuid";
import qs from "qs";
import FormData from "form-data";

let jobs: { [id: string]: Promise<boolean> } = {};
let status: { [id: string]: AxiosProgressEvent & { fileName: string } } = {};
let results: { [id: string]: any } = {};

export async function checkFile(url: string) {
	const result = await axios.head(url);
	return JSON.parse(JSON.stringify(result.headers));
}

export async function getStatus() {
	return status;
}

export async function downloadFile(url: string, fileName: string) {
	const id = uuidv4();
	jobs[id] = axios(url, {
		responseType: "arraybuffer",
		onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
			const progressWithFileName = progressEvent as AxiosProgressEvent & { fileName: string };
			progressWithFileName.fileName = fileName;
			status[id] = progressWithFileName;
		},
	})
		.then((response) => {
			results[id] = response.data;
			return true;
		})
		.catch((error) => {
			console.error(error);
			return false;
		});
}

export async function cancelDownload() {}

export async function upload(id: string, fileName: string) {
	const req1 = await axios(
		"https://www.terabox.com/api/precreate?app_id=250528&web=1&channel=dubox&clienttype=0&jsToken=5FAB18A17E69904FE2E3BDC20BF030C1CCAC6A29803A4C13DFAB0953072F3A50E4B7CD758FD9EA83AD4F6B8A0B46EA9CAC210877009E0E94222A925F454BDA58&dp-logid=38607300137720150036",
		{
			method: "post",
			headers: {
				Accept: "application/json, text/plain, */*",
				"Accept-Language": "en-US,en;q=0.9,id;q=0.8",
				Connection: "keep-alive",
				"Content-Type": "application/x-www-form-urlencoded",
				Cookie: "csrfToken=hghng4NF9999756UFeyMSBmX; browserid=NdDg4pMyTllTl2ETJ3Bp4NmxEzOSMMh3oXh5vXM36tn_EXiubts8FHOxbJE=; __bid_n=18d07f83ede1bb246c4207; __stripe_mid=121f5556-fce9-4c12-a0f4-a022f6685d91d6a5af; lang=en; PANWEB=1; TSID=KSADeW5bLEKsjVU19rMXDZeAjAfaax4g; ndus=YTwUjKEteHuibMt_zgKLHMvgvvmoQWp4CyqCVdCa; ndut_fmt=FF327F2B8A5755F70959EE45BB5363991605B77C6F3A1E79FA7885C5138A3E2A",
				Origin: "https://www.terabox.com",
				Referer: "https://www.terabox.com/main?category=all",
				"Sec-Fetch-Dest": "empty",
				"Sec-Fetch-Mode": "cors",
				"Sec-Fetch-Site": "same-origin",
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0",
				"X-Requested-With": "XMLHttpRequest",
				"sec-ch-ua": '"Chromium";v="124", "Microsoft Edge";v="124", "Not-A.Brand";v="99"',
				"sec-ch-ua-mobile": "?0",
				"sec-ch-ua-platform": '"Windows"',
			},
			data: qs.stringify({
				path: "/" + fileName,
				autoinit: "1",
				target_path: "/",
				block_list: '["5910a591dd8fc18c32a8f3df4fdc1761"]',
				local_mtime: "1713380413",
			}),
		}
	);

	const form = new FormData();
	form.append("file", results[id], { filename: "blob" });

	const req2 = await axios(
		"https://c-jp.terabox.com/rest/2.0/pcs/superfile2?method=upload&app_id=250528&channel=dubox&clienttype=0&web=1&logid=MTcxNDA1MjIyNDA5MzAuNjg2ODg3NDE2NjMyMDk0OA==&path=" +
			req1.data.path +
			"&uploadid=" +
			req1.data.uploadid +
			"&uploadsign=0&partseq=0",
		{
			headers: {
				Accept: "*/*",
				"Accept-Language": "en-US,en;q=0.9,id;q=0.8",
				Connection: "keep-alive",
				"Content-Type": "multipart/form-data; boundary=----WebKitFormBoundaryYebnTtRBDSCsKh8M",
				Cookie: "browserid=NdDg4pMyTllTl2ETJ3Bp4NmxEzOSMMh3oXh5vXM36tn_EXiubts8FHOxbJE=; __bid_n=18d07f83ede1bb246c4207; PANWEB=1; TSID=KSADeW5bLEKsjVU19rMXDZeAjAfaax4g; ndus=YTwUjKEteHuibMt_zgKLHMvgvvmoQWp4CyqCVdCa",
				Origin: "https://www.terabox.com",
				Referer: "https://www.terabox.com/",
				"Sec-Fetch-Dest": "empty",
				"Sec-Fetch-Mode": "cors",
				"Sec-Fetch-Site": "same-site",
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0",
				"sec-ch-ua": '"Chromium";v="124", "Microsoft Edge";v="124", "Not-A.Brand";v="99"',
				"sec-ch-ua-mobile": "?0",
				"sec-ch-ua-platform": '"Windows"',
				...form.getHeaders(),
			},
			data: form,
			method: "POST",
		}
	);

	const req3 = await axios(
		"https://www.terabox.com/api/create?isdir=0&rtype=1&bdstoken=d19ceff098763ab16de685c4a8dc0eea&app_id=250528&web=1&channel=dubox&clienttype=0&jsToken=5FAB18A17E69904FE2E3BDC20BF030C1CCAC6A29803A4C13DFAB0953072F3A50E4B7CD758FD9EA83AD4F6B8A0B46EA9CAC210877009E0E94222A925F454BDA58&dp-logid=35353200295319470024",
		{
			headers: {
				Accept: "application/json, text/plain, */*",
				"Accept-Language": "en-US,en;q=0.9,id;q=0.8",
				Connection: "keep-alive",
				"Content-Type": "application/x-www-form-urlencoded",
				Cookie: "csrfToken=hghng4NF9999756UFeyMSBmX; browserid=NdDg4pMyTllTl2ETJ3Bp4NmxEzOSMMh3oXh5vXM36tn_EXiubts8FHOxbJE=; __bid_n=18d07f83ede1bb246c4207; __stripe_mid=121f5556-fce9-4c12-a0f4-a022f6685d91d6a5af; lang=en; PANWEB=1; TSID=KSADeW5bLEKsjVU19rMXDZeAjAfaax4g; ndus=YTwUjKEteHuibMt_zgKLHMvgvvmoQWp4CyqCVdCa; ndut_fmt=78AC4970DA47F5E706E63FF96A67EE6AFC5BC470B86E8F007A48293ADAD72810",
				Origin: "https://www.terabox.com",
				Referer: "https://www.terabox.com/main?category=all",
				"Sec-Fetch-Dest": "empty",
				"Sec-Fetch-Mode": "cors",
				"Sec-Fetch-Site": "same-origin",
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0",
				"X-Requested-With": "XMLHttpRequest",
				"sec-ch-ua": '"Chromium";v="124", "Microsoft Edge";v="124", "Not-A.Brand";v="99"',
				"sec-ch-ua-mobile": "?0",
				"sec-ch-ua-platform": '"Windows"',
			},
			data: qs.stringify({
				path: "/" + fileName,
				size: Buffer.from(results[id]).byteLength,
				uploadid: req2.data.uploadid,
				target_path: "/",
				block_list: '["' + req2.data.md5 + '"]',
				local_mtime: "1714028576",
			}),
			method: "post",
		}
	);

	return req3.data;
}
