import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams,useLocation } from "react-router-dom";
import ReactPlayer from "react-player";
import "./CourseContentPage.css";
import { useAuth } from "../../Context/auth.js";
import Navbar from "../Home/NavBar.js";
import noContent from "./no-content.png";

const CourseContentPage = () => {
  const { courseId } = useParams();
  const [courseContent, setCourseContent] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [watchedContentIds, setWatchedContentIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const [auth] = useAuth();
  const [isVideoWatched, setIsVideoWatched] = useState(false);
  const playerRef = useRef(null);
  const location = useLocation();
  const courseName = location.state?.courseName;

  useEffect(() => {
    const fetchCourseContent = async () => {
      try {
        const token = auth?.token;
        const response = await axios.get(
          `http://localhost:8080/api/content/enrolled/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Course Content Response:", response.data);
        setCourseContent(response.data);
        const firstVideo = response.data[0]?.content_url;
        setSelectedVideo(firstVideo || null);
      } catch (err) {
        console.error("Error fetching course content:", err);
        setError("Error fetching course content");
      } finally {
        setLoading(false);
      }
    };

    const fetchWatchedVideos = async () => {
      try {
        if (!auth?.user?.user_id) {
          console.warn("User ID not available, skipping fetchWatchedVideos.");
          return;
        }

        const token = auth.token;
        const response = await axios.get(
          `http://localhost:8080/api/video/track/${auth.user.user_id}/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

       
        if (response.data && response.data.length > 0) {
          const contentIds = new Set(
            response.data.map((item) => item.content_id)
          );
          console.log("Watched Content IDs:", contentIds);
          setWatchedContentIds(contentIds);
        } else {
          console.log("No watched videos found for this user and course.");
        }
      } catch (err) {
        console.error("Error fetching watched videos:", err);
        setError("Error fetching watched videos");
      }
    };

    if (auth?.user) {
      fetchWatchedVideos();
      fetchCourseContent();
    }
  }, [courseId, auth]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.load();
      setIsVideoWatched(false); 
    }
  }, [selectedVideo]);

  const handleProgress = ({ played }) => {
    if (played >= 0.5 && !isVideoWatched) {
      setIsVideoWatched(true);
      const contentItem = courseContent.find(
        (content) => content.content_url === selectedVideo
      );
      if (contentItem) markVideoAsWatched(contentItem.content_id);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      const watchedPercentage = (video.currentTime / video.duration) * 100;
      if (watchedPercentage >= 50 && !isVideoWatched) {
        setIsVideoWatched(true);
        const contentItem = courseContent.find(
          (content) => content.content_url === selectedVideo
        );
        if (contentItem) {
          markVideoAsWatched(contentItem.content_id); 
        }
      }
    }
  };

  const markVideoAsWatched = async (contentId) => {
    try {
      const token = auth.token;
      await axios.post(
        "http://localhost:8080/api/video/track",
        {
          userId: auth.user.user_id,
          courseId: courseId,
          contentId: contentId, 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Video marked as watched");
    } catch (error) {
      console.error("Error marking video as watched:", error);
      setError("Error updating video watch status");
    }
  };

  // if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (courseContent.length === 0)
    return (
      <>
        <Navbar />
        <div className="no-content-student">
        <div>
          <img src={noContent} alt="No content available" />
        <p>No content available for this course.</p>
        </div>
        </div>
      </>
    );

  return (
    <>
      <Navbar />
      <div className="course-content-page">
        <div className="video-player">
          {selectedVideo ? (
            <ReactPlayer
              ref={playerRef}
              url={selectedVideo}
              controls
              width="100%"
              height="auto"
              onProgress={handleProgress}
              config={{
                file: {
                  attributes: {
                    controlsList: "nodownload", 
                  },
                },
              }}
            />
          ) : (
            <p>No video selected</p>
          )}
        </div>

        <div className="content-list">
        <h3>{courseName ? `Welcome to ${courseName}` : "Course Content"}</h3>
          <ul>
            {courseContent.map((content) => (
              <li
                key={content.content_id}
                className={
                  content.content_url === selectedVideo ? "active" : ""
                }
                onClick={() => {
                  if (content.content_url) {
                    setSelectedVideo(content.content_url);
                  } else {
                    alert("You need to enroll to access this content.");
                  }
                }}
                style={{
                  cursor: "pointer",
                  borderBottom: watchedContentIds.has(content.content_id)
                    ? "4px solid red"
                    : "none"
                }}
              >
                {content.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default CourseContentPage;