// import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Formik, Field, Form as FormikForm, ErrorMessage } from 'formik';
import * as yup from 'yup';
import React, { useEffect } from 'react';

/*
const TextInput = React.forwardRef((props, ref) => (  
  <Form.Control {...props} ref={ref} />  
));
*/

const AddChannelForm = ({ isOpen, onClose, onSubmit, existingChannels }) => {

  const validationSchema = yup.object().shape({
    name: yup
      .string()
      .min(3, 'Имя должно содержать минимум 3 символа')
      .max(20, 'Имя должно содержать не более 20 символов')
      .required('Имя обязательно')
      .notOneOf(existingChannels, 'Имя канала должно быть уникальным'),
  });

  useEffect(() => {  
    if (isOpen) {  
      // Ждем, пока модальное окно будет открыто  
      const inputElement = document.getElementById('channelNameInput');  
      if (inputElement) {  
        inputElement.focus();  
      }  
    }  
  }, [isOpen]); // Запускаем эффект, когда состояние модального окна меняется  

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Добавить канал</Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <Formik  
          initialValues={{ name: '' }}  
          validationSchema={validationSchema}  
          onSubmit={(values, { resetForm }) => {  
            onSubmit(values.name); 
            resetForm();  
            onClose();  
          }}  
        >
          {({ errors, touched }) => (
            <FormikForm>
              <Form.Group className="mb-2">
                <Form.Label>Имя канала</Form.Label>
                <Field  
                  name="name"  
                  id="channelNameInput" // Уникальный ID для элемента  
                  as={Form.Control}  
                  isInvalid={touched.name && !!errors.name}  
                /> 
                <Form.Control.Feedback type="invalid">
                  <ErrorMessage name="name" />
                </Form.Control.Feedback>
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={onClose} className="me-2">
                  Отменить
                </Button>
                <Button type="submit" variant="primary">
                  Отправить
                </Button>
              </div>
            </FormikForm>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
};

export default AddChannelForm;
