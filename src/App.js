import React, { useState, useEffect } from "react";
import "./App.css";

const App = () => {
  const [playlists, setPlaylists] = useState([
    { name: "Playlist 1", tracks: [] },
    { name: "Playlist 2", tracks: [] },
  ]);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const [audioRef, setAudioRef] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [songDetails, setSongDetails] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // Key for resetting file input

  useEffect(() => {
    // Load the last playing audio file
    const lastPlayedTrackIndex = parseInt(
      localStorage.getItem("lastPlayedTrackIndex")
    );
    const lastPlayedPlaylistIndex = parseInt(
      localStorage.getItem("lastPlayedPlaylistIndex")
    );
    if (
      !isNaN(lastPlayedTrackIndex) &&
      playlists[lastPlayedPlaylistIndex]?.tracks[lastPlayedTrackIndex]
    ) {
      setCurrentTrackIndex(lastPlayedTrackIndex);
      setCurrentPlaylistIndex(lastPlayedPlaylistIndex);
    }
  }, []);

  useEffect(() => {
    // Save the current playing track and playlist index
    localStorage.setItem("lastPlayedTrackIndex", currentTrackIndex);
    localStorage.setItem("lastPlayedPlaylistIndex", currentPlaylistIndex);

    // Update document title with current song name
    if (currentTrackIndex !== -1) {
      document.title = `Now Playing: ${songDetails[currentTrackIndex]?.name}`;
    } else {
      document.title = "Music Player";
    }
  }, [currentTrackIndex, currentPlaylistIndex, songDetails]);

  useEffect(() => {
    // Reset player state if the current playing song is removed
    if (
      currentTrackIndex !== -1 &&
      playlists[currentPlaylistIndex]?.tracks.length === 0
    ) {
      setCurrentTrackIndex(-1);
      setIsPlaying(false);
    }
  }, [playlists, currentTrackIndex, currentPlaylistIndex]);

  const handleFileUpload = (event) => {
    const files = event.target.files;
    const newTrackList = [...playlists[currentPlaylistIndex].tracks];
    const newSongDetails = [...songDetails];
    for (let i = 0; i < files.length; i++) {
      newTrackList.push(URL.createObjectURL(files[i]));
      newSongDetails.push({
        name: files[i].name,
        singer: "Unknown",
        duration: "Unknown",
      });
    }
    const newPlaylists = [...playlists];
    newPlaylists[currentPlaylistIndex].tracks = newTrackList;
    setPlaylists(newPlaylists);
    setSongDetails(newSongDetails);
    if (currentTrackIndex === -1) {
      setCurrentTrackIndex(0);
    }
    setFileInputKey(Date.now());
  };

  const handlePlayPause = () => {
    if (currentTrackIndex !== -1) {
      if (audioRef.paused) {
        audioRef.play();
      } else {
        audioRef.pause();
      }
      setIsPlaying(!audioRef.paused);
    }
  };

  const handlePlayNext = () => {
    if (currentTrackIndex < playlists[currentPlaylistIndex].tracks.length - 1) {
      if (!audioRef.paused) {
        audioRef.pause();
        setIsPlaying(false);
      }
      setCurrentTrackIndex(currentTrackIndex + 1);
    } else {
      setCurrentTrackIndex(0);
    }
  };

  const handlePlayPrev = () => {
    if (currentTrackIndex > 0) {
      if (!audioRef.paused) {
        audioRef.pause();
        setIsPlaying(false);
      }
      setCurrentTrackIndex(currentTrackIndex - 1);
    } else {
      setCurrentTrackIndex(playlists[currentPlaylistIndex].tracks.length - 1);
    }
  };

  const handlePlaylistChange = (index) => {
    setCurrentPlaylistIndex(index);
    setCurrentTrackIndex(-1);
  };

  const handleTrackChange = (index) => {
    setCurrentTrackIndex(index);
  };

  const handleDeleteTrack = (index) => {
    const newPlaylists = playlists.map((playlist) => ({
      ...playlist,
      tracks: playlist.tracks.filter((_, i) => i !== index),
    }));
    setPlaylists(newPlaylists);
    setSongDetails(songDetails.filter((_, i) => i !== index));
    if (currentTrackIndex === index) {
      setCurrentTrackIndex(-1);
      setIsPlaying(false);
    } else if (currentTrackIndex > index) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };

  const handlePlaylistNameChange = (index, newName) => {
    const newPlaylists = [...playlists];
    newPlaylists[index].name = newName;
    setPlaylists(newPlaylists);
  };

  const handleNewPlaylistNameChange = (event) => {
    setNewPlaylistName(event.target.value);
  };

  const handleAddPlaylist = () => {
    if (newPlaylistName.trim() !== "") {
      const newPlaylists = [
        ...playlists,
        { name: newPlaylistName.trim(), tracks: [] },
      ];
      setPlaylists(newPlaylists);
      setNewPlaylistName("");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <div className="container mx-auto p-4 bg-gray-800 text-white rounded-md shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Music Player</h2>
        <div className="mb-4 flex items-center">
          <input
            key={fileInputKey}
            type="file"
            accept="audio/*"
            multiple
            className="bg-gray-700 border border-gray-600 rounded-md py-2 px-4 w-full mr-4"
            onChange={handleFileUpload}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            onClick={handleAddPlaylist}
          >
            Add Playlist
          </button>
        </div>
        <div className="flex justify-between">
          <div className="w-1/4 mr-4">
            <h2 className="text-lg font-bold mb-2">Playlists</h2>
            <div>
              {playlists.map((playlist, index) => (
                <div
                  key={index}
                  className={`cursor-pointer mb-2 ${
                    currentPlaylistIndex === index ? "font-bold" : ""
                  }`}
                  onClick={() => handlePlaylistChange(index)}
                >
                  <input
                    type="text"
                    value={playlist.name}
                    onChange={(e) =>
                      handlePlaylistNameChange(index, e.target.value)
                    }
                    className="bg-transparent border-b border-gray-600 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="w-3/4">
            <h2 className="text-lg font-bold mb-2">Tracks</h2>
            <div>
              {playlists[currentPlaylistIndex]?.tracks.length === 0 ? (
                <div className="text-gray-400">No tracks available</div>
              ) : (
                playlists[currentPlaylistIndex]?.tracks.map((track, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer mb-2 flex justify-between items-center ${
                      currentTrackIndex === index ? "font-bold" : ""
                    }`}
                  >
                    <div onClick={() => handleTrackChange(index)}>
                      <div>{songDetails[index].name}</div>
                      <div className="text-sm text-gray-500">
                        {songDetails[index].singer}
                      </div>
                      <div className="text-sm text-gray-500">
                        {songDetails[index].duration}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTrack(index)}
                      className="text-red-500 hover:text-red-600 focus:outline-none"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center mt-4">
          <button
            className={`bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 mr-4 ${
              currentTrackIndex === -1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handlePlayPrev}
            disabled={currentTrackIndex === -1}
          >
            Prev
          </button>
          <button
            className={`bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 mr-4 ${
              currentTrackIndex === -1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handlePlayPause}
            disabled={currentTrackIndex === -1}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            className={`bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 ${
              currentTrackIndex === -1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handlePlayNext}
            disabled={currentTrackIndex === -1}
          >
            Next
          </button>
        </div>
        {currentTrackIndex !== -1 && (
          <audio
            ref={(audio) => setAudioRef(audio)}
            src={playlists[currentPlaylistIndex].tracks[currentTrackIndex]}
            className="w-full mt-4"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            controls
          />
        )}
      </div>
    </div>
  );
};

export default App;
