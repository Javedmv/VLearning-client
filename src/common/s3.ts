import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { CourseData } from '../types/Courses';
import { TOBE } from "./constants";

const S3_BUCKET = import.meta.env.VITE_S3_BUCKET_NAME!;
const REGION = import.meta.env.VITE_AWS_REGION!;
const ACCESS_KEY = import.meta.env.VITE_AWS_ACCESS_KEY_ID!;
const SECRET_ACCESS_KEY = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY!;

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

export const uploadLessonsToS3 = async (courseData: CourseData) => {
  const uploadedLessons = [];
  
  try {
    // Upload thumbnail to S3
    const { thumbnail, title } = courseData.basicDetails;
    console.log("thumbnail", thumbnail, "for megana");
    if (!thumbnail) {
      throw new Error("No thumbnail file provided for the course.");
    }

    // Assuming thumbnail is a File object from input
    if (!(thumbnail instanceof File)) {
      throw new Error("Invalid thumbnail file.");
    }

    // Create a safe filename for the thumbnail
    const safeThumbnailName = `thumbnail_${title.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}`;
    const thumbnailPath = `courseThumbnail/${safeThumbnailName}`;

    const thumbnailBuffer = await thumbnail.arrayBuffer();
    const thumbnailUint8Array = new Uint8Array(thumbnailBuffer);
    const thumbnailParams = {
      Bucket: S3_BUCKET,
      Key: thumbnailPath,
      Body:thumbnailUint8Array, // Convert to Buffer
      ContentType: thumbnail.type || 'image/png',
    };

    await s3.send(new PutObjectCommand(thumbnailParams));
    courseData.basicDetails.thumbnail = thumbnailPath; // Update thumbnail with S3 filename

    // Upload lessons to S3
    for (const lesson of courseData.courseContent.lessons) {
      try {
        const { videoUrl, title } = lesson;
        if (!videoUrl) {
          throw new Error(`No video file provided for lesson: ${title}`);
        }

        // Assuming videoUrl is a File object from input
        if (!(videoUrl instanceof File)) {
          throw new Error(`Invalid video file for lesson: ${title}`);
        }

        // Create a safe filename by removing spaces and special characters
        const safeTitle = title.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `${safeTitle}_${Date.now()}`;
        const filePath = `courses/${fileName}`;

        const videoBuffer = await videoUrl.arrayBuffer();
        const videoUint8Array = new Uint8Array(videoBuffer);
        const params = {
          Bucket: S3_BUCKET,
          Key: filePath,
          Body: videoUint8Array, // Convert to Buffer
          ContentType: videoUrl.type || 'video/mp4',
        };

        await s3.send(new PutObjectCommand(params));

        // Add uploaded lesson to the array
        uploadedLessons.push({
          ...lesson,
          videoUrl: filePath, // Store only the filename
        });
      } catch (lessonError) {
        console.error(`Failed to upload video for lesson "${lesson.title}":`, lessonError);
        throw lessonError;
      }
    }

  } catch (error) {
    console.error("Failed to upload course assets to S3:", error);
    throw error;
  }

  return {
    ...courseData,
    courseContent: {
      ...courseData.courseContent,
      lessons: uploadedLessons,
    },
  };
};


export const uploadEditedLessonTos3 = async (course: TOBE) => {
  try {
    const updatedLesson: TOBE[] = [...course.courseContent.lessons];
    const { thumbnail, title } = course.basicDetails;

    // Handle thumbnail upload
    if (thumbnail instanceof File) {
      if (!thumbnail) {
        throw new Error(`No thumbnail file provided for course: ${title}`);
      }
      try {
        const safeThumbnailName = `thumbnail_${title.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}`;
        const thumbnailPath = `courseThumbnail/${safeThumbnailName}`;
        
        const thumbnailParams = {
          Bucket: S3_BUCKET,
          Key: thumbnailPath,
          Body: thumbnail, // File object
          ContentType: thumbnail?.type || 'image/png',
        };
  
        await s3.send(new PutObjectCommand(thumbnailParams));
        course.basicDetails.thumbnail = thumbnailPath;
      } catch (error) {
        console.error("ERROR uploadEditedLessonTos3 - thumbnail", error);       
      }
    }

    // Handle lesson video uploads
    for (let index = 0; index < course.courseContent.lessons.length; index++) {
      const lesson = course.courseContent.lessons[index];
      try {
        if (lesson.videoPreview) {
          const { videoUrl, title } = lesson;

          // Ensure videoUrl is valid
          if (!videoUrl) {
            throw new Error(`No video file provided for lesson at index ${index}: ${title}`);
          }

          if (!(videoUrl instanceof File)) {
            throw new Error(`Invalid video file for lesson at index ${index}: ${title}`);
          }

          const safeTitle = title.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase();
          const fileName = `${safeTitle}_${Date.now()}`;
          const filePath = `courses/${fileName}`;
          
          const params = {
            Bucket: S3_BUCKET,
            Key: filePath,
            Body: videoUrl,
            ContentType: videoUrl?.type || 'video/mp4',
          };

          await s3.send(new PutObjectCommand(params));

          updatedLesson[index].videoUrl = String(filePath); // Assign the updated videoUrl
        }
      } catch (error) {
        console.error(`ERROR uploadEditedLessonTos3 - lesson at index ${index}:`, error);
      }
    }

    // Return updated course data
    return {
      ...course,
      courseContent: {
        ...course.courseContent,
        lessons: updatedLesson,
      },
    };
  } catch (error) {
    alert("Failed to upload course assets to S3:");
    console.error("ERROR : uploadEditedLessonTos3 ::", error);
  }
};
