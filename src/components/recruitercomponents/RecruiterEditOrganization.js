import React, { useState, useEffect } from 'react';
import { useUserContext } from '../common/UserProvider';
import { apiUrl } from '../../services/ApplicantAPIService';
import axios from 'axios';
import Snackbar from '../common/Snackbar';
import { useNavigate } from 'react-router-dom'; // Ensure react-router-dom is installed and set up

function RecruiterEditOrganization() {
  const userContext = useUserContext();
  const user = userContext.user;
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    companyName: '',
    website: '',
    phoneNumber: '',
    email: '',
    headOffice: '',
    aboutCompany: '',
    socialProfiles: {
      twitter: '',
      instagram: '',
      youtube: '',
      linkedin: '',
    },
  });

  const [headOffice, setHeadOffice] = useState('');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [youtube, setYoutube] = useState('');
  const [linkedin, setLinkedin] = useState(''); 
  const [companyName, setCompanyName] = useState('');
    const [website, setWebsite] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [aboutCompany, setAboutCompany] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [imageSrc, setImageSrc] = useState('');
  const [token, setToken] = useState('');
  const [isProfileSubmitted, setIsProfileSubmitted] = useState(
    localStorage.getItem('isProfileSubmitted') === 'true'
  );
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: '' });
  const [formErrors, setFormErrors] = useState({
    companyName: '',
    website: '',
    phoneNumber: '',
    email: '',
    headOffice: '',
    aboutCompany: '',
    twitter: '',
    instagram: '',
    youtube: '',
    linkedin: '',
  });
  const [isHovered, setIsHovered] = useState(false);

  const buttonStyle = {
    backgroundColor: isHovered ? '#ea670c' : '#F97316',
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginLeft: '5px',
    marginTop: '5px',
    transition: 'background-color 0.3s ease',
  };

  // Fetch JWT Token on Mount
  useEffect(() => {
    const storedToken = localStorage.getItem('jwtToken');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Fetch Company Profile and Logo when token or user.id changes
  useEffect(() => {
    if (token && user.id) {
      fetchCompanyProfile();
      fetchCompanyLogo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user.id]);

  // Fetch Company Profile
  const fetchCompanyProfile = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/companyprofile/recruiter/getCompanyProfile/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data;
      const { socialProfiles } = data;

      setProfile({
        companyName: data.companyName || '',
        website: data.website || '',
        phoneNumber: data.phoneNumber || '',
        email: data.email || '',
        headOffice: data.headOffice || '',
        aboutCompany: data.aboutCompany || '',
        socialProfiles: {
            twitter: socialProfiles[0],
            instagram: socialProfiles[1],
            youtube: socialProfiles[2],
            linkedin: socialProfiles[3],
        },
      });
    } catch (error) {
      console.error('Error fetching company profile:', error);
      setSnackbar({ open: true, message: 'Failed to fetch company profile.', type: 'error' });
    }
  };

  // Fetch Company Logo
  const fetchCompanyLogo = async () => {
    try {
      const response = await fetch(`${apiUrl}/recruiters/companylogo/download/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setImageSrc(imageUrl);
    } catch (error) {
      console.error('Error fetching image URL:', error);
      setImageSrc(''); // Optionally set to a default image
    }
  };

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;

    switch (id) {
      case 'companyName':
        setProfile({ ...profile, companyName: value });
        break;
      case 'phoneNumber':
        setProfile({ ...profile, phoneNumber: value });
        break;
      case 'email':
        setProfile({ ...profile, email: value });
        break;
      case 'website':
        const websiteRegex = /\.(com|in|org)$/;
        const isValidWebsite = websiteRegex.test(value);
  
        setProfile({ ...profile, website: value });
  
        if (!isValidWebsite) {
          setFormErrors({ ...formErrors, website: 'Website should end with .com, .in, or .org' });
        } else {
          setFormErrors({ ...formErrors, website: '' });
        }
        break;
      case 'headOffice':
        setProfile({ ...profile, headOffice: value });
        break;
      case 'aboutCompany':
        setProfile({ ...profile, aboutCompany: value });
        break;
      // Handle other input fields
      default:
        break;
      }
    if (['twitter', 'instagram', 'youtube', 'linkedin'].includes(id)) {
      setProfile((prevProfile) => ({
        ...prevProfile,
        socialProfiles: {
          ...prevProfile.socialProfiles,
          [id]: value,
        },
      }));
    } else {
      setProfile((prevProfile) => ({
        ...prevProfile,
        [id]: value,
      }));
    }

    // Clear corresponding error
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [id]: '',
    }));
  };

  // Validate Form
  const validateForm = () => {
    let isValid = true;
    const errors = {};

    if (!profile.companyName.trim()) {
      errors.companyName = 'Company name is required';
      isValid = false;
    } else if (profile.companyName.trim().length < 3) {
      errors.companyName = 'Company name must be at least 3 characters';
      isValid = false;
    }

    if (!profile.website.trim()) {
      errors.website = 'Website is required';
      isValid = false;
    } else {
      const websiteRegex = /\.(com|in|org)$/;
      if (!websiteRegex.test(profile.website.trim())) {
        errors.website = 'Website should end with .com, .in, or .org';
        isValid = false;
      }
    }

    if (profile.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
      errors.email = 'Invalid email address';
      isValid = false;
    }

    if (profile.phoneNumber.trim() && !/^[6-9]\d{9}$/.test(profile.phoneNumber.trim())) {
      errors.phoneNumber = 'Invalid phone number';
      isValid = false;
    }

    //  if (profile.headOffice.trim().length < 3) {
    //   errors.headOffice = 'Head office address must be at least 3 characters';
    //   isValid = false;
    // }

    if (!profile.aboutCompany.trim()) {
      errors.aboutCompany = 'About company is required';
      isValid = false;
    } else if (profile.aboutCompany.length < 50) {
      errors.aboutCompany = 'About company must be at least 50 characters long';
      isValid = false;
    } else if (profile.aboutCompany.length > 500) {
      errors.aboutCompany = 'About company cannot exceed 500 characters';
      isValid = false;
    }
    

    // Validate social profiles
   // Inside your validateForm function

// Define a URL validation regex
const urlPattern = new RegExp(
    '^(https?:\\/\\/)?' + // Protocol (optional)
    '((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,})' + // Domain name
    '(\\/[-a-zA-Z\\d%_.~+]*)*' + // Path (optional)
    '(\\?[;&a-zA-Z\\d%_.~+=-]*)?' + // Query string (optional)
    '(\\#[-a-zA-Z\\d_]*)?$', // Fragment identifier (optional)
    'i' // Case-insensitive
  );
  
  // Validate social profiles as URLs
  Object.entries(profile.socialProfiles).forEach(([key, value]) => {
    if (value.trim() && !urlPattern.test(value.trim())) {
      errors[key] = `Invalid ${key.charAt(0).toUpperCase() + key.slice(1)} URL`;
      isValid = false;
    }
  });
  

    setFormErrors(errors);
    return isValid;
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const requestData = {
        companyName: profile.companyName,
        website: profile.website,
        phoneNumber: profile.phoneNumber,
        email: profile.email,
        headOffice: profile.headOffice,
        aboutCompany: profile.aboutCompany,
        socialProfiles: [
            profile.socialProfiles.twitter,
            profile.socialProfiles.instagram,
            profile.socialProfiles.youtube,
            profile.socialProfiles.linkedin,
        ],
      };

      await axios.put(
        `${apiUrl}/companyprofile/companyprofile/update-companyprofile/${user.id}`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        type: 'success',
      });

      setIsProfileSubmitted(true);
      localStorage.setItem('isProfileSubmitted', 'true');

      // Delay navigation to allow Snackbar to display
      setTimeout(() => {
        navigate('/recruiter-view-organization');
      }, 3000); // 2-second delay
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({ open: true, message: 'Error updating profile', type: 'error' });
    }
  };

  // Handle File Selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setPhotoFile(file);
  };

  // Upload Photo
  const uploadPhoto = async () => {
    if (!photoFile) {
      setSnackbar({ open: true, message: 'Please select a file to upload.', type: 'error' });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('logoFile', photoFile);

      const response = await axios.post(
        `${apiUrl}/recruiters/companylogo/upload/${user.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSnackbar({ open: true, message: 'Photo uploaded successfully.', type: 'success' });
      fetchCompanyLogo(); // Refresh the logo
    } catch (error) {
      console.error('Error uploading photo:', error);
      setSnackbar({ open: true, message: 'Error uploading photo.', type: 'error' });
    }
  };

  // Handle Snackbar Close
  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', type: '' });
  };

  return (
    <div>
      <div className="dashboard__content">
        <section className="page-title-dashboard">
          <div className="themes-container">
            <div className="row">
              <div className="col-lg-12 col-md-12 ">
                <div className="title-dashboard">
                  {/* <BackButton /> */}
                  <div className="title-dash flex2">My Organization</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="flat-dashboard-post flat-dashboard-setting">
          <form name="f1" onSubmit={handleSubmit}>
            <div className="themes-container">
              <div className="row">
                <div className="col-lg-12 col-md-12 ">
                  <div className="profile-setting bg-white">
                    <div className="author-profile flex2 border-bt">
                      <div className="wrap-img flex2">
                        <div className="img-box relative">
                          <img
                            width="100px"
                            height="100px"
                            src={imageSrc || '../images/user/avatar/profile-pic.png'}
                            alt="Profile"
                            onError={() => setImageSrc('../images/user/avatar/profile-pic.png')}
                            style={{
                              borderRadius: '100%',
                              position: 'relative',
                              width: '100px',
                              height: '100px',
                            }}
                          />
                        </div>
                        <div className="upload-profile">
                          <div className="upload-section">
                            <div className="upload-photo">
                              <h5 className="fw-6">Upload Company Logo:</h5>
                              <h6>JPG or PNG</h6>
                              <input
                                id="tf-upload-img"
                                type="file"
                                name="logoFile"
                                accept=".jpg,.jpeg,.png"
                                onChange={handleFileSelect}
                              />
                              <br />
                              <button
                                type="button"
                                onClick={uploadPhoto}
                                className="btn-3"
                                style={buttonStyle}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                              >
                                Upload Photo
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* You can add more elements here if needed */}
                    </div>
                    <div className="form-infor-profile">
                      <h3 className="title-info">Information</h3>
                      <div className="row">
                        {/* Company Full Name */}
                        <div className="col-lg-6 col-md-6">
                          <div className="dropdown titles-dropdown info-wd">
                            <label className="title-user fw-7">
                              Company Full Name<span className="color-red">*</span>
                            </label>
                            <input
                              type="text"
                              id="companyName"
                              className="input-form"
                              placeholder="ABC Company Pvt. Ltd"
                              value={profile.companyName}
                              onChange={handleInputChange}
                              
                            />
                            {formErrors.companyName && (
                              <div className="error-message">{formErrors.companyName}</div>
                            )}
                          </div>
                        </div>

                        {/* Alternate Phone Number */}
                        <div className="col-lg-6 col-md-6">
                          <div className="dropdown titles-dropdown info-wd">
                            <label className="title-user fw-7">Alternate Phone Number</label>
                            <input
                              type="text"
                              id="phoneNumber"
                              className="input-form"
                              placeholder="Alternate Phone Number"
                              value={profile.phoneNumber}
                              onChange={handleInputChange}
                            />
                            {formErrors.phoneNumber && (
                              <div className="error-message">{formErrors.phoneNumber}</div>
                            )}
                          </div>
                        </div>

                        {/* Alternate Email */}
                        <div className="col-lg-6 col-md-6">
                          <div className="dropdown titles-dropdown info-wd">
                            <label className="title-user fw-7">Alternate Email</label>
                            <input
                              type="email"
                              id="email"
                              className="input-form"
                              placeholder="support@abc.com"
                              value={profile.email}
                              onChange={handleInputChange}
                            />
                            {formErrors.email && (
                              <div className="error-message">{formErrors.email}</div>
                            )}
                          </div>
                        </div>

                        {/* Website */}
                        <div className="col-lg-6 col-md-6">
                          <div className="dropdown titles-dropdown info-wd">
                            <label className="title-user fw-7">
                              Website<span className="color-red">*</span>
                            </label>
                            <input
                              type="text"
                              id="website"
                              className="input-form"
                              placeholder="www.abc.com"
                              value={profile.website}
                              onChange={handleInputChange}
                              
                            />
                            {formErrors.website && (
                              <div className="error-message">{formErrors.website}</div>
                            )}
                          </div>
                        </div>

                        {/* Head Office Address */}
                        <div className="col-lg-6 col-md-6">
                          <div className="dropdown titles-dropdown info-wd">
                            <label className="title-user fw-7">Head Office Address</label>
                            <input
                              type="text"
                              id="headOffice"
                              className="input-form"
                              placeholder="Head Office Address"
                              value={profile.headOffice}
                              onChange={handleInputChange}
                           
                            />
                            {formErrors.headOffice && (
                              <div className="error-message">{formErrors.headOffice}</div>
                            )}
                          </div>
                        </div>

                        {/* About Company */}
                        <div className="col-lg-12 col-md-12">
                          <div className="about-company">
                            <h3>About</h3>
                            <br />
                            <div className="row">
                              <div className="col-md-12">
                                <label
                                  style={{ color: '#64666C' }}
                                  className="title-user fw-7"
                                >
                                  About Company<span className="color-red">*</span>
                                </label>
                                <textarea
                                  rows="4"
                                  id="aboutCompany"
                                  className="textarea"
                                  value={profile.aboutCompany}
                                  onChange={handleInputChange}
                                  
                                  style={{
                                    borderRadius: '8px',
                                    border: '1px solid #E5E5E5',
                                    background: '#F5F5F5',
                                    width: '100%',
                                    padding: '10px',
                                  }}
                                />
                                {formErrors.aboutCompany && (
                                  <div className="error-message">
                                    {formErrors.aboutCompany}
                                  </div>
                                )}
                              </div>
                            </div>
                            <br />
                          </div>
                        </div>

                        {/* Social Network */}
                        <div className="col-lg-12 col-md-12">
                          <div className="social-wrap">
                            <h3>Social Network</h3>
                            <div className="form-box info-wd wg-box">
                              {/* YouTube */}
                              <div className="col-lg-6 col-md-6">
                                <fieldset className="flex2">
                                  <span className="icon-youtube" />
                                  <input
                                    type="text"
                                    id="youtube"
                                    className="input-form2"
                                    placeholder="YouTube"
                                    value={profile.socialProfiles.youtube}
                                    onChange={handleInputChange}
                                  />
                                  {formErrors.youtube && (
                                    <div className="error-message">{formErrors.youtube}</div>
                                  )}
                                </fieldset>
                              </div>

                              {/* Twitter */}
                              <div className="col-lg-6 col-md-6">
                                <fieldset className="flex2">
                                  <span className="icon-twitter" />
                                  <input
                                    type="text"
                                    id="twitter"
                                    className="input-form2"
                                    placeholder="Twitter"
                                    value={profile.socialProfiles.twitter}
                                    onChange={handleInputChange}
                                  />
                                  {formErrors.twitter && (
                                    <div className="error-message">{formErrors.twitter}</div>
                                  )}
                                </fieldset>
                              </div>

                              {/* Instagram */}
                              <div className="col-lg-6 col-md-6">
                                <fieldset className="flex2">
                                  <span className="icon-instagram1" />
                                  <input
                                    type="text"
                                    id="instagram"
                                    className="input-form2"
                                    placeholder="Instagram"
                                    value={profile.socialProfiles.instagram}
                                    onChange={handleInputChange}
                                  />
                                  {formErrors.instagram && (
                                    <div className="error-message">{formErrors.instagram}</div>
                                  )}
                                </fieldset>
                              </div>

                              {/* LinkedIn */}
                              <div className="col-lg-6 col-md-6">
                                <fieldset className="flex2">
                                  <span className="fa-brands fa-linkedin" />
                                  <input
                                    type="text"
                                    id="linkedin"
                                    className="input-form2"
                                    placeholder="LinkedIn"
                                    value={profile.socialProfiles.linkedin}
                                    onChange={handleInputChange}
                                  />
                                  {formErrors.linkedin && (
                                    <div className="error-message">{formErrors.linkedin}</div>
                                  )}
                                </fieldset>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Save Profile Button */}
                    <div className="col-lg-12 col-md-12">
                      <div className="save-profile" align="right">
                        <button type="submit" className="button-status">
                          Save Profile
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
                </div>
              </form>
            
          </section>
        </div>

        {/* Snackbar for Notifications */}
        {snackbar.open && (
          <Snackbar
            message={snackbar.message}
            type={snackbar.type}
            onClose={handleCloseSnackbar}
          />
        )}
      </div>
    
  );
}

export default RecruiterEditOrganization;
