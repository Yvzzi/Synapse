# Packet Interface Protocol v3
## 1. Packet format
### 1.1 B2S (S: Server side, B: Browser side, 2: to)
```json
{
    "code": 0, // number
    "data": {}, // {}
    "file": {} // {[filename: string]: File}
}
```
### 1.2
```json
{
    "code": 0, // number
    "data": {}, // {}
    "message": "", // string
    "debug": [], // string[]
}
```
### 1.3 B2S & S2B With Other type of Data
You can use this approach to upload binary data or download in this protocol..

## 2. JavaScript Side Net
```typescript
interface NetOption {
    cache?: "default" | "assume-no-cache" | "reload" | "only-if-cached"// default: default
    credentials?: "include" | "omit", // default: omit
    auth: string | null
    headers: {}
}

class Net {
	/** Generate a Net Object */
   	constructor(baseurl: string, option: NetOption);
	static net(baseurl: string, option: NetOption): Net;
	/** Method to send data Object */
    send(method: string, url: string, data: any): Promise<any>;
    get(url: string, data: any): Promise<any>;
    post(url: string, data: any): Promise<any>;
    update(url: string, data: any): Promise<any>;
    patch(url: string, data: any): Promise<any>;
    get(url: string, data: any): Promise<any>;
    delete(url: string, data: any): Promise<any>;
    put(url: string, data: any): Promise<any>;
    /** Method to send serveral data Object */
    all(requests: Promise<T>[]): Promise<T[]>;
    /** Config method */
    withFilter(filter: {}): Net;
    withHeader(header: {}): Net;
    withInterceptor(interceptor: Function): Net;
    withPacketInterceptor(): Net;
    withConfig(config: NetOption): Net;
    withTimeOut(time: number): Net;
    withQuery(): Net;
    withText(): Net;
    withJson(): Net;
    withElement(): Net;
    withForm(): Net;
    withBinary(): Net;
    withPacket(): Net;
    withAny(): Net;
    asText(): Net;
    asJson(): Net;
    asBlob(): Net;
    asArrayBuffer(): Net;
    asPacket(): Net;
    /** Control method */
    abort(): void;
    /** Handle method */
    handle(): Promise<Response>;
    progress(handler: (rate: number, reader: ReadableStreamReader) => void): void;
    success(handler: (data: any) => void): void;
    fail(handler: (data: any) => void): void;
}
```