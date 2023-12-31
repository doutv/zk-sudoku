/* global BigInt */

import { groth16 } from "snarkjs";
import { wasmBase64 } from "./sudoku/wasm";

function unstringifyBigInts(o) {
  if (typeof o == "string" && /^[0-9]+$/.test(o)) {
    return BigInt(o);
  } else if (typeof o == "string" && /^0x[0-9a-fA-F]+$/.test(o)) {
    return BigInt(o);
  } else if (Array.isArray(o)) {
    return o.map(unstringifyBigInts);
  } else if (typeof o == "object") {
    if (o === null) return null;
    const res = {};
    const keys = Object.keys(o);
    keys.forEach((k) => {
      res[k] = unstringifyBigInts(o[k]);
    });
    return res;
  } else {
    return o;
  }
}

// function decodeBase64File(uint8Array) {
//   const base64 = String.fromCharCode.apply(null, uint8Array);
//   const str = window.atob(base64);
//   const encoder = new TextEncoder();
//   const res = encoder.encode(str);
//   return res;
// }

export async function exportCallDataGroth16(input, wasmPath, zkeyPath) {
  const wasmBytes = Uint8Array.from(atob(wasmBase64), c => c.charCodeAt(0));
  // let wasmFile = await fetch(wasmPath).then(function (res) {
  //   return res.arrayBuffer();
  // }).then(function (ab) {
  //   return new Uint8Array(ab);
  // });
  // try {
  //   wasmFile = decodeBase64File(wasmFile);
  // } catch (e) {
  //   console.log("wasm not in base64");
  // }
  // console.log(wasmFile.byteLength);

  const { proof, publicSignals } = await groth16.fullProve(
    input,
    wasmBytes,
    zkeyPath
  );

  const editedPublicSignals = unstringifyBigInts(publicSignals);
  const editedProof = unstringifyBigInts(proof);
  const calldata = await groth16.exportSolidityCallData(
    editedProof,
    editedPublicSignals
  );

  const argv = calldata
    .replace(/["[\]\s]/g, "")
    .split(",")
    .map((x) => BigInt(x).toString());

  const a = [argv[0], argv[1]];
  const b = [
    [argv[2], argv[3]],
    [argv[4], argv[5]],
  ];
  const c = [argv[6], argv[7]];
  const Input = [];

  for (let i = 8; i < argv.length; i++) {
    Input.push(argv[i]);
  }

  return [a, b, c, Input];
}
