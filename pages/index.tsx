import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <div
      className="bg-cover"
      style={{
        backgroundImage: "url('images/background.png')",
        minHeight: "100vh",
      }}
    >
      <div className="relative z-10 py-5">Web3 base.</div>
    </div>
  );
};

export default Home;
