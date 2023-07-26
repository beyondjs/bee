require('@beyond-js/bee')('http://localhost:5050', { hmr: true });

(async () => {
	console.log('--> Test start...');
	const { Test } = await bimport('@beyond-js/playground/test');
	const model = new Test();
	await model.run();
	console.log('--> Test end...');
})();
