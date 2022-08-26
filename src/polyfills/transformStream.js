const _jstds_wm = new WeakMap(); /* info holder */
class JSTextDecoderStream extends TransformStream {
    constructor(encoding = 'utf-8', { ...options } = {}) {
        const t = {
            start() {
                this.decoder = new TextDecoder(this.encoding, this.options);
            },
            transform(chunk, controller) {
                controller.enqueue(
                    this.decoder.decode(chunk, { stream: true })
                );
            },
            encoding,
            options,
        };

        super(t);
        _jstds_wm.set(this, t);
    }
    get encoding() {
        return _jstds_wm.get(this).decoder.encoding;
    }
    get fatal() {
        return _jstds_wm.get(this).decoder.fatal;
    }
    get ignoreBOM() {
        return _jstds_wm.get(this).decoder.ignoreBOM;
    }
}
if (typeof window.TextDecoderStream === 'undefined') {
    window.TextDecoderStream = JSTextDecoderStream;
}
