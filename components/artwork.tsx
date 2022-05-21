import { Modal } from "../components";
import { useGetArtwork } from "../queries";

export default function Artwork({ isArtworkOpen, setArtworkOpen, creator }) {
  const { isLoading, data, error } = useGetArtwork(creator);

  return data ? (
    <Modal
      isOpen={isArtworkOpen}
      toggleModal={() => setArtworkOpen((pm) => !pm)}
      title={`View Artwork`}
    >
      {isLoading && <div>Loading...</div>}
      {error && <div>Error loading artwork...</div>}
      {data?.tokenContracts[0]?.versions[0].animation.url ? (
        <iframe
          className="w-screen"
          width="800px"
          height="800px"
          src={data?.tokenContracts[0]?.versions[0]?.animation?.url}
        />
      ) : (
        <div>No artwork available.</div>
      )}
    </Modal>
  ) : (
    <div></div>
  );
}
