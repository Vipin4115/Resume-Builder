//controller for creating new resume

import imagekit from "../configs/imagekit.js";
import Resume from "../models/Resume.js";
import fs from 'fs';

const createResume = async (req, res) => {
    try {
        const userId = req.userId;
        const { title } = req.body;
        //create new resume
        const newResume = await Resume.create({
            userId, title
        })

        return res.status(201).json({ message: "Resume created successfully", resume: newResume })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// controller for deleting the resume
const deleteResume = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId } = req.params;

        await Resume.findOneAndDelete({ userId, _id: resumeId })

        return res.status(200).json({ message: "Resume deleted successfully" })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// get user resume by id
const getResumeById = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId } = req.params;

        const resume = await Resume.findOne({ userId, _id: resumeId })

        if (!resume) {
            return res.status(404).json({ message: "Resume not found" })
        }
        resume.__v = undefined;
        resume.createdAt = undefined;
        resume.updatedAt = undefined;


        return res.status(200).json({ resume })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}



//get resume by id public
const getPublicResumeById = async (req, res) => {
    try {
        const { resumeId } = req.params;

        const resume = await Resume.findOne({ public: true, _id: resumeId })

        if (!resume) {
            return res.status(404).json({ message: "Resume not found" })
        }

        return res.status(200).json({ resume })

    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// controller for updating the resume


const updateResume = async (req, res) => {
  try {
    console.log('--- updateResume called ---');
    console.log('req.body keys:', Object.keys(req.body));
    console.log('req.file present?', Boolean(req.file));
    console.log('raw req.body:', req.body);

    const userId = req.userId;
    const { resumeId } = req.body;
    let { resumeData, removeBackground } = req.body;
    const image = req.file;

    // parse resumeData safely
    let resumeDataCopy;
    if (typeof resumeData === 'string') {
      try {
        resumeDataCopy = JSON.parse(resumeData);
      } catch (err) {
        return res.status(400).json({ message: 'Invalid resumeData JSON' });
      }
    } else if (resumeData && typeof resumeData === 'object') {
      resumeDataCopy = (typeof structuredClone === 'function')
        ? structuredClone(resumeData)
        : JSON.parse(JSON.stringify(resumeData));
    } else {
      resumeDataCopy = {};
    }

    // Normalize removeBackground
    removeBackground = (removeBackground === true)
      || (removeBackground === 'true')
      || (removeBackground === '1')
      || (removeBackground === 1)
      || (removeBackground === 'yes');

    // --- IMAGE UPLOAD SECTION ---
    if (!image) {
      console.log('No image provided. Skipping upload.');
    } else {
      // Validate presence of usable data
      const hasBuffer = Boolean(image.buffer && image.buffer.length > 0);
      const hasPath = Boolean(image.path && fs.existsSync(image.path));

      if (!hasBuffer && !hasPath) {
        console.warn('req.file present but no buffer and no valid path. Skipping upload.');
      } else {
        // Helper that returns "file" suitable for ImageKit per attempt:
        const makeFileForUpload = () => {
          if (hasBuffer) {
            return image.buffer; // Buffer is safe to reuse across retries
          } else {
            // For disk storage, create a fresh ReadStream each time
            return fs.createReadStream(image.path);
          }
        };

        // Build base options (no transformation attached yet)
        const baseUploadOptionsBuilder = (file) => {
          const opts = {
            file,
            fileName: image.originalname || 'resume.jpg',
            folder: 'user-resumes'
          };
          if (removeBackground) opts.extensions = [{ name: 'bg-removal' }];
          return opts;
        };

        // safe transformation (string values)
        const safeTransform = [
          { width: String(300), height: String(300), focus: 'face', zoom: String(0.75) }
        ];

        // helper to call ImageKit (supports SDK variants)
        const doUpload = async (opts) => {
          if (imagekit.files && typeof imagekit.files.upload === 'function') {
            return await imagekit.files.upload(opts);
          } else if (typeof imagekit.upload === 'function') {
            return await imagekit.upload(opts);
          } else {
            throw new Error('ImageKit upload method not found. Check SDK version.');
          }
        };

        // Try upload with transformation first (if desired), retry without it if provider complains.
        let response = null;
        try {
          const fileForUpload = makeFileForUpload();
          const opts = baseUploadOptionsBuilder(fileForUpload);
          // attach transformation — comment out if you want to avoid upload-time transforms
          opts.transformation = safeTransform;
          console.log('Attempting upload with transformation...');
          response = await doUpload(opts);
        } catch (err) {
          const providerInfo = err?.response?.data || err?.message || String(err);
          console.warn('ImageKit upload failed (first attempt). Message:', providerInfo);

          // If the error mentions "transformation" or "invalid", retry WITHOUT transformation.
          const text = JSON.stringify(providerInfo || '');
          if (text.toLowerCase().includes('transformation') || text.toLowerCase().includes('invalid')) {
            try {
              console.warn('Retrying upload WITHOUT transformation...');
              const fileForUpload2 = makeFileForUpload(); // <-- recreate stream if disk
              const opts2 = baseUploadOptionsBuilder(fileForUpload2);
              response = await doUpload(opts2);
            } catch (err2) {
              console.error('ImageKit upload failed on retry (without transformation):', err2?.response?.data || err2?.message || err2);
              const errMessage = err2?.response?.data?.message || err2?.message || String(err2);
              return res.status(500).json({ message: 'Image upload failed', error: errMessage });
            }
          } else {
            // Not a transformation-related error — surface it
            console.error('ImageKit upload failed (non-transformation reason):', providerInfo);
            const errMessage = err?.response?.data?.message || err?.message || String(err);
            return res.status(500).json({ message: 'Image upload failed', error: errMessage });
          }
        }

        // Success - attach image URL
        const imageUrl = response?.url || response?.filePath || response?.name || null;
        if (!resumeDataCopy.personal_info) resumeDataCopy.personal_info = {};
        resumeDataCopy.personal_info.image = imageUrl;

        // cleanup temp file for disk storage (optional)
        if (!hasBuffer && image.path) {
          fs.unlink(image.path, (unlinkErr) => {
            if (unlinkErr) console.warn('Failed to remove temp file:', unlinkErr);
          });
        }
      }
    } // end image handling

    // Update DB
    const resume = await Resume.findOneAndUpdate(
      { userId, _id: resumeId },
      resumeDataCopy,
      { new: true }
    );

    if (!resume) return res.status(404).json({ message: 'Resume not found' });

    console.log('Resume updated successfully.');
    return res.status(200).json({ message: 'Saved successfully', resume });
  } catch (error) {
    console.error('updateResume error:', error?.response?.data || error.message || error);
    return res.status(400).json({ message: error.message || 'Unknown error' });
  }
};



export { createResume, deleteResume, getResumeById, getPublicResumeById, updateResume }