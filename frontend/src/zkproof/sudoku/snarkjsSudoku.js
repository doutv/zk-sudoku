import { exportCallDataGroth16 } from "../snarkjsZkproof";

export async function sudokuCalldata(unsolved, solved) {
  const input = {
    unsolved: unsolved,
    solved: solved,
  };

  let dataResult;

  try {
    dataResult = await exportCallDataGroth16(
      input,
    );
  } catch (error) {
    console.log(error);
    window.alert("Wrong answer");
  }

  return dataResult;
}
