// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";
import SeededSingleEditionMintable from "../../abis/SeededSingleEditionMintable.json";
import { EDITIONS_CONTRACT, PRIVATE_KEY, RPC_URL } from "../../constants";
type Data = {
  tx: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (!PRIVATE_KEY || !RPC_URL || !EDITIONS_CONTRACT)
    throw Error("PRIVATE_KEY or RPC_URL not set.");

  try {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

    const signer = new ethers.Wallet(PRIVATE_KEY, provider);

    const contract = new ethers.Contract(
      EDITIONS_CONTRACT,
      SeededSingleEditionMintable.abi,
      signer
    );

    const tx = await contract.functions.mintEdition(
      req.query.to,
      req.query.seed
    );

    const receipt = await tx.wait();

    res.json({ receipt });
  } catch (e) {
    res.json({ e });
  }
}
