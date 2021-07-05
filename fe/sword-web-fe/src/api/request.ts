export type SwordRequester = (path:string, options?: RequestInit) => Promise<any>

export const requestFactory = (onError: (code:number) => void) : SwordRequester => async (path:string, options?: RequestInit) : Promise<any> => {

    if(options) {
        options.headers = new Headers({'content-type': 'application/json'})
    }

    try {
        const raw = await fetch(path,options)
        const result = await raw.json()
        if(raw.ok) {
            return result
        }
        else {
            onError(raw.status)
            return Promise.reject(result)
        }
    }

    catch(err) {

        return Promise.reject(err)

    }

}