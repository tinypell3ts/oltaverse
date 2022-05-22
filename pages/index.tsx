import { MapControls } from "@react-three/drei";
import { Canvas, useLoader } from "@react-three/fiber";
import { useConnectWallet } from "@web3-onboard/react";
import React, { Suspense, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import { Button, Modal } from "../components";
import { useGetPurchases } from "../queries";

function getBackgroundColor(stringInput) {
  const h = [...stringInput].reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const s = 95,
    l = 35 / 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function Cell({
  color,
  shape,
  fillOpacity,
  index,
  tokens,
  handlePurchase,
  openArtwork,
}) {
  const [hovered, set] = useState(false);
  const isSold = Boolean(tokens.find((t) => parseInt(t.seed) === index));
  const soldToken = tokens.find((t) => parseInt(t.seed) === index);

  return (
    <mesh
      onClick={() =>
        isSold
          ? openArtwork(soldToken?.owner?.id, index)
          : handlePurchase(index)
      }
      onPointerOver={(e) => !isSold && set(true)}
      onPointerOut={() => !isSold && set(false)}
    >
      <meshBasicMaterial
        color={
          isSold
            ? getBackgroundColor(soldToken?.owner?.id)
            : hovered
            ? "hotpink"
            : color
        }
        opacity={fillOpacity}
        depthWrite={false}
        transparent
      />
      <shapeBufferGeometry args={[shape]} />
    </mesh>
  );
}

function Svg({ url, data, setOpen, handlePurchase, openArtwork }) {
  const { paths } = useLoader(SVGLoader, url);
  const shapes = useMemo(
    () =>
      paths.flatMap((p) =>
        p.toShapes(true).map((shape) => ({
          shape,
          color: p.color,
          fillOpacity: p.userData.style.fillOpacity,
        }))
      ),
    [paths]
  );

  return (
    <group>
      {shapes.map((props, index) => (
        <Cell
          handlePurchase={handlePurchase}
          setOpen={setOpen}
          index={index}
          tokens={data.tokens}
          key={props.shape.uuid}
          openArtwork={openArtwork}
          {...props}
        />
      ))}
    </group>
  );
}

export default function App() {
  const [{ wallet }] = useConnectWallet();
  const [isOpen, setOpen] = useState(false);
  const [isArtworkOpen, setArtworkOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [owner, setOwner] = useState();
  const [receipt, setTxReceipt] = useState();
  const { isLoading, data, error } = useGetPurchases(2000);
  const connectedWallet = wallet?.accounts[0].address;

  async function verifyPurchase(index) {
    setCurrentIndex(index);
    setOpen(true);
  }

  async function openArtwork(owner, index) {
    setCurrentIndex(index);
    setOwner(owner);
    setArtworkOpen(true);
  }

  async function handleMint() {
    setOpen(false);

    const params = new URLSearchParams({
      to: wallet?.accounts[0].address,
      seed: currentIndex,
    });

    const tx = await toast.promise(
      fetch(`/api/mint?${params}`)
        .then((res) => res.json())
        .catch((e) => console.log("e =>", e)),
      {
        loading: `Purchasing land...`,
        success: "Land purchased 🚀",
        error: "Error purchasing land, please try again...",
      },
      { position: "bottom-right" }
    );

    setTxReceipt(tx);
  }

  if (isLoading) return <div className="h-screen">Loading...</div>;
  return (
    <div className="h-full">
      <div className="absolute bg-transparent p-10">
        <h1 className="text-5xl font-bold tracking-tight">OLTA ISLAND</h1>
        <h2 className="w-2/3 text-xl font-semibold tracking-tight">
          Connect your wallet and click on a piece of land to purchase it.
        </h2>
      </div>
      <Canvas
        frameloop="demand"
        orthographic
        camera={{ position: [0, 0, 1], zoom: 1, up: [0, 0, 1], far: 10000 }}
      >
        <Suspense fallback={null}>
          <Svg
            data={data.tokenContract}
            url="/map.svg"
            setOpen={setOpen}
            handlePurchase={verifyPurchase}
            openArtwork={openArtwork}
          />
        </Suspense>
        <MapControls enableRotate={false} />
      </Canvas>
      <Modal
        isOpen={isOpen}
        toggleModal={() => setOpen((pm) => !pm)}
        title={`Buy Land - Plot #${currentIndex}`}
      >
        <Button disabled={!connectedWallet} onClick={handleMint}>
          Purchase
        </Button>
      </Modal>
      <Modal
        isOpen={isArtworkOpen}
        toggleModal={() => setArtworkOpen((a) => !a)}
        title={`Plot #${currentIndex}`}
      >
        <h2 className="font-bold">owner:</h2> {owner}
      </Modal>
      {/* <Artwork
        isArtworkOpen={isArtworkOpen}
        setArtworkOpen={setArtworkOpen}
        creator="0x03755352654d73da06756077dd7f040adce3fd58"
      /> */}
    </div>
  );
}
