import { MapControls } from "@react-three/drei";
import { Canvas, useLoader } from "@react-three/fiber";
import { gql, request } from "graphql-request";
import React, {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactDOM from "react-dom";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";

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

function Cell({ color, shape, fillOpacity, index, tokens }) {
  console.log({ index });
  return (
    <mesh>
      <meshBasicMaterial
        color={
          Boolean(tokens.find((t) => parseInt(t.seed) === index))
            ? getBackgroundColor(index.toString())
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

function Svg({ url, data }) {
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

  const ref = useRef();
  useLayoutEffect(() => {
    const sphere = new THREE.Box3()
      .setFromObject(ref.current)
      .getBoundingSphere(new THREE.Sphere());
    ref.current.position.set(-sphere.center.x, -sphere.center.y, 0);
  }, []);

  console.log("this is data", data.tokens);

  return (
    <group ref={ref}>
      {shapes.map((props, index) => (
        <Cell
          index={index}
          tokens={data.tokens}
          key={props.shape.uuid}
          {...props}
        />
      ))}
    </group>
  );
}

export default function App(props) {
  return (
    <div className="h-screen w-screen bg-indigo-500">
      <Canvas
        frameloop="demand"
        orthographic
        camera={{
          position: [0, 0, 10],
          zoom: 1,
          up: [0, 0, 1],
          far: 10000,
        }}
      >
        <Suspense fallback={null}>
          <Svg data={props.tokenContract} url="/map.svg" />
        </Suspense>
        <MapControls enableRotate={false} />
      </Canvas>
    </div>
  );
}

export async function getStaticProps(ctx) {
  const query = gql`
    query {
      tokenContract(id: "0x0db0c7743d04dc56b7a43ecf6c5b3c91c0b79540") {
        id
        tokens {
          id
          seed
        }
      }
    }
  `;

  const data = await request(
    "https://api.thegraph.com/subgraphs/name/olta-art/olta-editions-mumbai",
    query
  );

  console.log({ data });
  return {
    props: data,
  };
}
