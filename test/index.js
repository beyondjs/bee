require('@beyond-js/bee')('http://localhost:6501', {hmr: true});

(async () => {
    const {message} = await bimport('@beyond-js/counter-react-widget/hello');
    console.log(message);
})();
