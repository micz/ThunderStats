export class tsLogger {

    do_debug = false;
    prefix = "";
    constructor(prefix,do_debug) {
        this.do_debug = do_debug;
        this.prefix = "[tsLogger|" + prefix + "] ";
    }
    log(msg) {
        if(this.do_debug === true) console.log(this.prefix + msg);
    }
    error(msg) {
        if(this.do_debug === true) console.error(this.prefix + msg);
    }
    warn(msg) {
        if(this.do_debug === true) console.warn(this.prefix + msg);
    }  
};