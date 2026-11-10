import { useEffect, useRef, useState } from 'react';
import {
  basicsFields, careFields, creditFields, creditTypes, healthFields, initialStaffPetValues,
  temperamentOptions, validateStaffPetStep,
} from '../../data/staffPetFields.js';
import useForm from '../../hooks/useForm.js';
import { getStaffPetGallery, saveStaffPet, staffPetError } from '../../services/staffPetService.js';
import { petPhotoTypes, processPetImage } from '../../utils/imageProcessing.js';
import FormField from '../forms/FormField.jsx';
import Alert from '../ui/Alert.jsx';
import Button from '../ui/Button.jsx';
import FallbackImage from '../ui/FallbackImage.jsx';
import Modal from '../ui/Modal.jsx';
import { Spinner } from '../ui/Spinner.jsx';

const steps = ['Basics', 'Health and suitability', 'Story and photos', 'Review and publish'];

function Review({ values }) {
  const { story, photos, creditType, photographer, source, url, temperament } = values;
  return (
    <div className="staff-pet-review">
      <dl className="admin-detail-group">
        {[...basicsFields, ...healthFields, ...careFields].map(({ name, label }) => (
          <div key={name}><dt>{label}</dt><dd>{typeof values[name] === 'boolean' ? (values[name] ? 'Yes' : 'No') : values[name] || '—'}</dd></div>
        ))}
      </dl>
      <p><strong>Temperament</strong> {temperament.join(', ') || '—'}</p>
      <p><strong>Story</strong> {story}</p>
      <p><strong>Photo credit</strong> {creditType === 'stock' ? photographer + ' · ' + source : creditTypes.staff}</p>
      {creditType === 'stock' && <p><a href={url} target="_blank" rel="noreferrer">View photo source</a></p>}
      <div className="staff-pet-photos">
        {photos.map(({ src, alt }, index) => (
          <figure key={index}><FallbackImage alt={alt} height={150} src={src} width={200} />
            <figcaption>{index === 0 ? 'Main photo' : 'Photo ' + (index + 1)} · {alt}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

function PetEditor({ pet, species, initialPhotos, uid, onClose, onSaved }) {
  const [step, setStep] = useState(0);
  const [photoError, setPhotoError] = useState('');
  const [processing, setProcessing] = useState('');
  const processingRef = useRef(false);
  const headingRef = useRef(null);
  const form = useForm({
    initialValues: initialStaffPetValues(pet, species, initialPhotos),
    validate: (values) => step < 3 ? validateStaffPetStep(step, values)
      : { ...validateStaffPetStep(0, values), ...validateStaffPetStep(1, values), ...validateStaffPetStep(2, values) },
  });
  const { values, errors, handleBlur, handleChange, isSubmitting, touched } = form;
  const busy = Boolean(processing) || isSubmitting;

  useEffect(() => {
    if (step > 0) headingRef.current?.focus();
  }, [step]);

  const errorFor = (name) => touched[name] ? errors[name] : '';
  const setValue = (name, value) => handleChange({ target: { name, value } });
  const setPhotos = (photos) => setValue('photos', photos);
  const field = ({ name, label, options, type, optional, ...props }) => (
    <FormField key={name} name={name} label={label} type={type ?? (options ? 'select' : 'text')}
      options={options} value={values[name]} required={!optional} error={errorFor(name)} onBlur={handleBlur} onChange={handleChange} {...props} />
  );

  async function addPhotos(event) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!files.length || processingRef.current) return;
    setPhotoError('');
    if (values.photos.length + files.length > 3) {
      setPhotoError('Choose up to three photos in total.');
      return;
    }
    processingRef.current = true;
    const added = [];
    const alt = [values.name.trim() + ',', 'a', values.colour.trim().toLowerCase(), values.species.toLowerCase()].join(' ');
    try {
      for (const [index, file] of files.entries()) {
        setProcessing('Processing photo ' + (index + 1) + ' of ' + files.length + '…');
        added.push({ src: await processPetImage(file), alt });
      }
      setPhotos([...values.photos, ...added]);
    } catch (error) {
      setPhotoError(error.message);
    } finally {
      processingRef.current = false;
      setProcessing('');
    }
  }

  async function advance(current) {
    if (processingRef.current) return;
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    try {
      onSaved(await saveStaffPet({ values: current, pet, uid }));
    } catch (error) {
      throw new Error(staffPetError(error));
    }
  }

  return (
    <Modal className="staff-pet-editor" onClose={() => { if (!busy) onClose(); }} open title={pet ? 'Edit pet' : 'Add pet'}>
      <ol aria-label="Pet editor steps" className="staff-pet-progress">
        {steps.map((label, index) => <li aria-current={step === index ? 'step' : undefined} key={label}>{index + 1}. {label}</li>)}
      </ol>
      <h3 ref={headingRef} tabIndex={-1}>{steps[step]}</h3>
      <form className="service-form" noValidate onSubmit={form.handleSubmit(advance)}>
        {form.submitError && <Alert tone="error">{form.submitError}</Alert>}
        <fieldset aria-label={steps[step] + ' fields'} className="staff-pet-step" disabled={busy}>
          {step === 0 && <div className="staff-pet-fields">{basicsFields.map(field)}</div>}
          {step === 1 && (
            <>
              <div className="staff-pet-fields">
                {healthFields.map(({ name, label }) => <FormField checked={values[name]} key={name} label={label} name={name} onChange={handleChange} type="checkbox" />)}
              </div>
              {careFields.map(field)}
            </>
          )}
          {step === 2 && (
            <>
              <fieldset className="staff-pet-step">
                <legend>Temperament</legend>
                <div className="admin-actions">
                  {temperamentOptions.map((trait) => (
                    <Button aria-pressed={values.temperament.includes(trait)} key={trait} size="small" type="button"
                      variant={values.temperament.includes(trait) ? 'primary' : 'outline'}
                      onClick={() => setValue('temperament', values.temperament.includes(trait)
                        ? values.temperament.filter((item) => item !== trait) : [...values.temperament, trait])}>{trait}</Button>
                  ))}
                </div>
              </fieldset>
              {field({ name: 'story', label: 'Story', type: 'textarea', maxLength: 600, hint: values.story.length + '/600 characters' })}
              <FormField accept={petPhotoTypes.join(',')} hint="JPEG, PNG or WebP, up to 8 MB each. Add a main photo and up to two more." label="Add photos"
                multiple name="petPhotos" onChange={addPhotos} type="file" disabled={values.photos.length >= 3} />
              <FormField accept={petPhotoTypes.join(',')} capture="environment" disabled={values.photos.length >= 3} label="Take a photo"
                name="cameraPhoto" onChange={addPhotos} type="file" />
              {photoError && <Alert tone="error">{photoError}</Alert>}
              {errorFor('photos') && <Alert tone="error">{errorFor('photos')}</Alert>}
              <div className="staff-pet-photos">
                {values.photos.map((photo, index) => (
                  <div key={index} className="staff-pet-photo">
                    <FallbackImage alt={photo.alt} height={150} src={photo.src} width={200} />
                    <FormField label={'Photo ' + (index + 1) + ' alt text'} maxLength={160} name={'photoAlt' + index}
                      onChange={(event) => setPhotos(values.photos.map((item, i) => i === index ? { ...item, alt: event.target.value } : item))}
                      required value={photo.alt} />
                    <div className="admin-actions">
                      {index === 0 ? <strong>Main photo</strong> : (
                        <Button aria-label={'Set photo ' + (index + 1) + ' as main photo'} onClick={() => setPhotos([photo, ...values.photos.filter((_, i) => i !== index)])}
                          size="small" type="button" variant="outline">Set as main photo</Button>
                      )}
                      <Button aria-label={'Remove photo ' + (index + 1)} onClick={() => setPhotos(values.photos.filter((_, i) => i !== index))}
                        size="small" type="button" variant="outline">Remove</Button>
                    </div>
                  </div>
                ))}
              </div>
              <FormField error={errorFor('creditType')} label="Photo credit" name="creditType" onBlur={handleBlur} onChange={handleChange}
                options={Object.entries(creditTypes).map(([value, label]) => ({ value, label }))} required type="select" value={values.creditType} />
              {values.creditType === 'stock' && creditFields.map(field)}
            </>
          )}
          {step === 3 && <Review values={values} />}
        </fieldset>
        {processing && <p role="status">{processing}</p>}
        <div className="admin-actions">
          {step > 0 && <Button disabled={busy} onClick={() => setStep(step - 1)} type="button" variant="outline">Back</Button>}
          <Button disabled={Boolean(processing)} loading={isSubmitting} type="submit">
            {step < 3 ? 'Next' : pet ? 'Save pet' : 'Publish pet'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function AddPetModal({ pet, species = '', uid, onClose, onSaved }) {
  const [initialPhotos, setInitialPhotos] = useState(pet ? null : []);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!pet) return;
    let current = true;
    getStaffPetGallery(pet.id).then((photos) => {
      if (current) setInitialPhotos([{ src: pet.image, alt: pet.imageAlt }, ...photos]);
    }, (failure) => {
      if (current) setError(staffPetError(failure));
    });
    return () => { current = false; };
  }, [pet, attempt]);

  if (!initialPhotos) {
    return (
      <Modal onClose={onClose} open title="Edit pet">
        {error ? <>
          <Alert tone="error">{error}</Alert>
          <Button onClick={() => { setError(''); setAttempt((value) => value + 1); }}>Retry loading photos</Button>
        </> : <Spinner label="Loading pet photos" />}
      </Modal>
    );
  }
  return <PetEditor initialPhotos={initialPhotos} onClose={onClose} onSaved={onSaved} pet={pet} species={species} uid={uid} />;
}
