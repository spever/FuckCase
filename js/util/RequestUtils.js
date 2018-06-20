

export default function RequestUtils(promise){

  let hasCanceled = false;

  const wrappedPromise = new Promise(((resolve, reject) => {
    promise.then((value) =>
        hasCanceled ? reject({isCanceled:true}): resolve(value)

    );
    promise.catch((error) =>
        hasCanceled ? reject({isCanceled:true}):reject(error)

    );
  }));

  return {
    promise:wrappedPromise,
    cancel(){
      hasCanceled = true;
    }
  }

}