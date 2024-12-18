import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container, Row, Col, Button, Alert, ButtonGroup, Form,
  InputGroup,
} from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import { useTranslation } from 'react-i18next';
import leoProfanity from 'leo-profanity';
import { useRollbar } from '@rollbar/react';
import {
  addMessage,
  fetchMessages,
  removeMessage,
  clearMessageError,
  getMessages,
  getMessagesStatus,
  getMessagesError,
} from '../store/messagesSlice';
import AddChannelForm from './AddNewChannel';
import {
  addChannel,
  removeChannel,
  editChannel,
  fetchChannels,
  clearChError,
  setCurrChIdStore,
  getChannels,
  getCurrentChannelId,
  getChannelError,
} from '../store/channelsSlice';
import { getUsername } from '../store/authSlice';
import { showNotification } from '../DefaulltComponents/NotificationComponent';
import RemoveModal from './RemoveModal';
import RenameChannel from './RenameChannel';

const Chat = () => {
  const dispatch = useDispatch();
  const channels = useSelector(getChannels);
  const messages = useSelector(getMessages);
  const status = useSelector(getMessagesStatus);
  const username = useSelector(getUsername);
  const currentChId = useSelector(getCurrentChannelId);
  const [newMessage, setNewMessage] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [isModalRemoveOpen, setModalRemoveOpen] = useState(false);
  const [isModalRenameOpen, setModalRenameOpen] = useState(false);
  const [channelId, setChannelId] = useState(null);
  const [currChannelName, setCurrChannelName] = useState('');
  // const error = useSelector((state) => state.messages.error);
  const inputRef = useRef(null);
  const { t } = useTranslation();
  const messageError = useSelector(getMessagesError);
  const channelError = useSelector(getChannelError);
  const rollbar = useRollbar();

  useEffect(() => {
    if (messageError) {
      showNotification(`${messageError}`, 'error');
      dispatch(clearMessageError());
    }
  }, [messageError, dispatch]);

  useEffect(() => {
    if (channelError) {
      showNotification(`${channelError}`, 'error');
      dispatch(clearChError());
    }
  }, [channelError, dispatch]);

  useEffect(() => {
    dispatch(fetchChannels());
    dispatch(fetchMessages());
  }, [dispatch]);

  useEffect(() => {
    if (inputRef.current && !isModalOpen) {
      inputRef.current.focus();
    }
  });

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      return;
    }

    const cleanMessage = leoProfanity.clean(newMessage);

    const message = {
      body: cleanMessage,
      channelId: currentChId,
      username,
    };

    await dispatch(addMessage(message));
    setNewMessage('');
  };

  const handleChannelClick = async (id) => {
    await dispatch(setCurrChIdStore(id));
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  if (status === 'failed') {
    return (
      <Alert variant="danger">
        {t('errors.error')}
        :
        <span>{messageError}</span>
      </Alert>
    );
  }

  const getCountText = (count) => t('chat.messages.count', { count });

  const handleAddChannel = async (channelName) => {
    try {
      const cleanChannelName = leoProfanity.clean(channelName);

      const newChannel = { name: cleanChannelName };
      const resultAction = await dispatch(addChannel(newChannel));

      if (addChannel.fulfilled.match(resultAction)) {
        showNotification(`${t('chat.channels.channelCreate')}`, 'success');
        await handleChannelClick(Number(resultAction.payload.id));
      } else {
        showNotification(`${t('chat.channels.channelNotCreate')}`, 'error');
      }
    } catch (err) {
      rollbar.error(`${t('errors.rollbar.errChannelAdd')}`, err);
      console.error(`${t('errors.rollbar.errChannelAdd')}`, err);
    }
  };

  const handleOpenRenameChannelModal = (chId) => {
    setModalRenameOpen(true);
    setChannelId(chId);
    const currentChannelName = channels.filter((channel) => channel.id === chId)[0].name;
    setCurrChannelName(currentChannelName);
  };

  const handleRenameChannel = async (chId, editedChannel) => {
    await dispatch(editChannel({ id: chId, editedChannel })); // Изменение здесь
    showNotification(`${t('chat.channels.channelIsRenamed')}`, 'success');
  };

  const handleDeleteChannel = async (chId) => {
    try {
      const delMessages = messages.filter((message) => Number(message.channelId) === Number(chId));
      delMessages.forEach((message) => dispatch(removeMessage(message.id)));
      await dispatch(removeChannel(chId));
      showNotification(`${t('chat.channels.channelIsRemoved')}`, 'success');
      handleChannelClick(1);
    } catch (err) {
      rollbar.error(`${t('error.rollbar.errChannelDelete')}`, err);
    }
  };

  const handleOpenRemoveModal = (chId) => {
    setModalRemoveOpen(true);
    setChannelId(chId);
  };

  const handleCloseRemoveModal = () => setModalRemoveOpen(false);

  const handleCloseRenameModal = () => setModalRenameOpen(false);

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <Container className="mt-4">
      <Row style={{ height: '90vh', boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)', borderRadius: '8px' }}>
        <Col xs={4} lg={2} className="border-end" style={{ borderColor: 'lightgray', padding: '0' }}>
          <div
            className="d-flex mt-1 justify-content-between align-items-center mb-2 ps-4 pe-2 p-4"
          >
            <b className="mb-0">{t('chat.channels.channels')}</b>
            <Button
              onClick={handleOpenModal}
              variant="outline-primary"
              className="d-flex align-items-center justify-content-center"
              style={{
                width: '20px',
                height: '20px',
                padding: 0,
                borderRadius: '2px',
                verticalAlign: 'baseline',
                fontSize: '16px',
                lineHeight: '20px',
              }}
            >
              +
            </Button>
          </div>
          <ButtonGroup vertical className="w-100">
            {channels.map((channel) => (
              Number(channel.id) < 3 ? (
                <Button
                  key={channel.id}
                  variant={`${Number(currentChId) === Number(channel.id) ? 'secondary' : 'light'}`}
                  className="w-100 rounded-0 text-start"
                  style={{
                    padding: '6px 12px',
                    borderRadius: 0,
                  }}
                  onClick={() => handleChannelClick(Number(channel.id))}
                >
                  {`# ${channel.name}`}
                </Button>
              ) : (
                <Dropdown
                  as={ButtonGroup}
                  key={channel.id}
                  onClick={() => handleChannelClick(Number(channel.id))}
                >
                  <Button
                    variant={`${Number(currentChId) === Number(channel.id) ? 'secondary' : 'light'}`}
                    title={`# ${channel.name}`}
                    className="w-100 rounded-0 text-start text-truncate"
                    style={{
                      width: '80%',
                      borderRadius: 0,
                    }}
                  >
                    {`# ${channel.name}`}
                  </Button>
                  <Dropdown.Toggle
                    split
                    variant={`${Number(currentChId) === Number(channel.id) ? 'secondary' : 'light'}`}
                    id={`dropdown-split-basic-${channel.id}`}
                    style={{
                      width: '20%',
                      borderRadius: 0,
                    }}
                  >
                    <span className="visually-hidden">{t('chat.channels.channelManagement')}</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => handleOpenRemoveModal(channel.id)}>{t('chat.channels.remove')}</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleOpenRenameChannelModal(channel.id)}>{t('chat.channels.rename')}</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              )
            ))}
          </ButtonGroup>
          <AddChannelForm
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleAddChannel}
            existingChannels={channels.map((ch) => ch.name)}
          />
          <RemoveModal
            isOpen={isModalRemoveOpen}
            onClose={handleCloseRemoveModal}
            onDelete={handleDeleteChannel}
            channelId={channelId}
          />
          <RenameChannel
            isOpen={isModalRenameOpen}
            onClose={handleCloseRenameModal}
            onRename={handleRenameChannel}
            channelId={channelId}
            currChannelName={currChannelName}
            existingChannels={channels.map((ch) => ch.name)}
          />
        </Col>
        <Col
          xs={8}
          lg={10}
          className="d-flex flex-column p-0"
          style={{
            height: '90vh',
          }}
        >
          <div
            className="w-100"
            style={{
              padding: '16px',
              flex: '0 0 auto',
            }}
          >
            <p className="m-0">
              <b>
                #
                {(
                  channels.find((channel) => Number(channel.id) === currentChId)?.name
                )}
              </b>
            </p>
            <span className="text-muted">
              {getCountText(messages.filter((m) => Number(m.channelId) === currentChId).length)}
            </span>
          </div>
          <div
            className="border-top"
            style={{
              borderColor: 'lightgray',
              overflowY: 'auto',
              flex: '1 1 auto',
              padding: '0 48px',
            }}
          >
            {messages.map((message) => {
              if (Number(message.channelId) === Number(currentChId)) {
                return (
                  <div
                    key={message.id}
                  >
                    <strong>{message.username}</strong>
                    :
                    <span>{message.body}</span>
                  </div>
                );
              }
              return null;
            })}
          </div>
          <Form
            onSubmit={handleMessageSubmit}
            style={{
              flex: '0 0 auto',
            }}
          >
            <InputGroup
              className="d-flex align-items-center"
              style={{ padding: '16px 48px' }}
            >
              <Form.Control
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={t('chat.messages.enterMessage')}
                className="me-2"
                aria-label={t('chat.messages.newMessage')}
              />
              <Button type="submit" variant="primary">
                ➔
              </Button>
            </InputGroup>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Chat;
