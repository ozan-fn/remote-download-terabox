"use client";

import { useEffect, useState } from "react";
import { checkFile, downloadFile, getStatus, upload } from "./actions/remote";
import { AxiosProgressEvent } from "axios";

export default function Home() {
	const [input, setInput] = useState("");
	const [status, setStatus] = useState<{ [id: string]: AxiosProgressEvent & { fileName: string } }>();

	useEffect(() => {
		async function i() {
			try {
				const res = await getStatus();
				setStatus({ ...res });
			} catch (error) {
				console.log(error);
			}
			setTimeout(i, 600);
		}
		i();
	}, []);

	return (
		<>
			<div className="bg-zinc-900 text-zinc-300">
				<div className="container mx-auto py-8 min-h-screen flex flex-col">
					<div className="flex flex-row">
						<input type="text" placeholder="url" onChange={(e) => setInput(e.target.value)} className="max-w-md w-full outline-none px-2 h-10 bg-zinc-800 border border-zinc-700" />
						<CheckUrlAndDownload input={input} />
					</div>

					{/* <div className="mt-4">
						<pre>{JSON.stringify(status, null, 4)}</pre>
					</div> */}

					<table className="table-auto mt-4 text-left">
						<thead>
							<tr>
								<th className="h-10 border-y px-2">no</th>
								<th className="h-10 border-y px-2">name</th>
								<th className="h-10 border-y px-2">size</th>
								<th className="h-10 border-y px-2">estimated</th>
								<th className="h-10 border-y px-2">progress</th>
								<th className="h-10 border-y px-2">rate</th>
								<th className="h-10 border-y px-2">action</th>
							</tr>
						</thead>
						<tbody>
							{status ? (
								Object.keys(status).map((v, i) => {
									const data = status?.[v];
									const isDownload = data.progress != 1;
									return (
										<tr key={i}>
											<th className="h-10 border-b px-2">{i + 1}.</th>
											<td className="h-10 border-b px-2">{data?.fileName}</td>
											<td className="h-10 border-b px-2">{(data.total! / 1024 / 1024)?.toFixed(2)} MB</td>
											<td className="h-10 border-b px-2">{data?.estimated?.toFixed(2)} s</td>
											<td className="h-10 border-b px-2">{(data.progress! * 100)?.toFixed(2)} %</td>
											<td className="h-10 border-b px-2">{(data.rate! / 1024 / 1024)?.toFixed(2)} MB/s</td>
											<td className="h-10 border-b px-2">
												<button onClick={() => upload(v, data.fileName)} disabled={isDownload} className={`${isDownload && "bg-green-800"} h-8 px-2 bg-green-600 text-white rounded-md`}>
													upload
												</button>
											</td>
										</tr>
									);
								})
							) : (
								<tr className="col-span-3">
									<td className="text-center">No data available!</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</>
	);
}

function CheckUrlAndDownload({ input }: { input: string }) {
	const [result, setResult] = useState<{ "content-length": string; "content-disposition": string }>();
	const [filename, setFilename] = useState("");

	var name = result?.["content-disposition"]?.match(/filename=(.+)/)?.[1];
	name = name ? decodeURIComponent(name) : undefined;

	async function check() {
		try {
			const res = await checkFile(input);
			if (res) return setResult(res);
		} catch (error) {
			console.error(error);
			alert("galat");
		}
	}

	async function download() {
		try {
			setResult(undefined);
			downloadFile(input, name || filename);
		} catch (error) {
			console.error(error);
			alert("galat");
		}
	}

	return (
		<>
			<button onClick={check} className="bg-zinc-800 border-zinc-700 border px-2 flex items-center justify-center ml-2">
				CHECK
			</button>

			{result && (
				<div className="absolute h-screen w-screen bg-zinc-900/70 top-0 left-0 flex justify-center items-center">
					<div className="max-w-md w-full p-4 bg-zinc-900 border border-zinc-800 rounded-md flex flex-col">
						<table className="font-mono">
							<thead>
								<tr>
									<td>name</td>
									<td className="px-1">:</td>
									<td>
										<input type="text" value={name || filename} onChange={(e) => setFilename(e.target.value)} className="bg-zinc-900 outline-none border border-zinc-800 text-zinc-300" />
									</td>
								</tr>
								<tr>
									<td>size</td>
									<td className="px-1">:</td>
									<td>{Math.round(+result["content-length"] / 1024 / 1024) + " MB"}</td>
								</tr>
							</thead>
						</table>

						<div className="flex flex-row gap-2 items-center">
							<button onClick={() => setResult(undefined)} className="mt-4 font-mono w-fit ml-auto bg-red-700 rounded-md px-2 h-8 flex items-center justify-center">
								cancel
							</button>
							<button onClick={download} className="mt-4 font-mono w-fit bg-green-700 rounded-md px-2 h-8 flex items-center justify-center">
								download
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
