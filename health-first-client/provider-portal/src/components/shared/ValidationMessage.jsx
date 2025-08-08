import React from 'react';
import {
  Box,
  Typography,
  Alert,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Info,
  Circle
} from '@mui/icons-material';

const ValidationMessage = ({
  type = 'error', // 'error', 'warning', 'info', 'success'
  message,
  messages = [], // Array of messages for multiple errors
  visible = true,
  title,
  variant = 'inline', // 'inline', 'alert', 'list'
  severity,
  sx = {},
  animate = true,
  showIcon = true,
  ...props
}) => {
  // Map type to MUI severity if not provided
  const getSeverity = () => {
    if (severity) return severity;
    
    switch (type) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'success':
        return 'success';
      default:
        return 'error';
    }
  };

  // Get appropriate icon for message type
  const getIcon = () => {
    if (!showIcon) return null;
    
    const iconProps = { fontSize: 'small' };
    
    switch (type) {
      case 'error':
        return <Error {...iconProps} />;
      case 'warning':
        return <Warning {...iconProps} />;
      case 'info':
        return <Info {...iconProps} />;
      case 'success':
        return <CheckCircle {...iconProps} />;
      default:
        return <Error {...iconProps} />;
    }
  };

  // Get color based on type
  const getColor = () => {
    switch (type) {
      case 'error':
        return 'error.main';
      case 'warning':
        return 'warning.main';
      case 'info':
        return 'info.main';
      case 'success':
        return 'success.main';
      default:
        return 'error.main';
    }
  };

  // If no message or messages provided, don't render
  if (!message && (!messages || messages.length === 0)) {
    return null;
  }

  const renderInlineMessage = () => (
    <Collapse in={visible} timeout={animate ? 300 : 0}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
          color: getColor(),
          ...sx
        }}
        {...props}
      >
        {getIcon()}
        <Typography
          variant="body2"
          sx={{
            fontSize: '0.875rem',
            lineHeight: 1.43,
            color: 'inherit'
          }}
        >
          {message}
        </Typography>
      </Box>
    </Collapse>
  );

  const renderAlertMessage = () => (
    <Collapse in={visible} timeout={animate ? 300 : 0}>
      <Alert
        severity={getSeverity()}
        icon={showIcon ? undefined : false}
        sx={sx}
        {...props}
      >
        {title && (
          <Typography variant="subtitle2" component="div" sx={{ mb: 0.5 }}>
            {title}
          </Typography>
        )}
        {message && (
          <Typography variant="body2">
            {message}
          </Typography>
        )}
        {messages && messages.length > 0 && (
          <Box sx={{ mt: message ? 1 : 0 }}>
            {messages.map((msg, index) => (
              <Typography key={index} variant="body2" sx={{ mb: 0.25 }}>
                • {msg}
              </Typography>
            ))}
          </Box>
        )}
      </Alert>
    </Collapse>
  );

  const renderListMessage = () => (
    <Collapse in={visible} timeout={animate ? 300 : 0}>
      <Box sx={sx} {...props}>
        {title && (
          <Typography
            variant="subtitle2"
            sx={{
              color: getColor(),
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            {getIcon()}
            {title}
          </Typography>
        )}
        {message && (
          <Typography
            variant="body2"
            sx={{
              color: getColor(),
              mb: messages.length > 0 ? 1 : 0
            }}
          >
            {message}
          </Typography>
        )}
        {messages && messages.length > 0 && (
          <List dense sx={{ py: 0 }}>
            {messages.map((msg, index) => (
              <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
                <ListItemIcon sx={{ minWidth: 20 }}>
                  <Circle sx={{ fontSize: 6, color: getColor() }} />
                </ListItemIcon>
                <ListItemText
                  primary={msg}
                  primaryTypographyProps={{
                    variant: 'body2',
                    sx: { color: getColor() }
                  }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Collapse>
  );

  switch (variant) {
    case 'alert':
      return renderAlertMessage();
    case 'list':
      return renderListMessage();
    case 'inline':
    default:
      return renderInlineMessage();
  }
};

// Helper components for specific use cases
export const ErrorMessage = (props) => (
  <ValidationMessage type="error" {...props} />
);

export const WarningMessage = (props) => (
  <ValidationMessage type="warning" {...props} />
);

export const InfoMessage = (props) => (
  <ValidationMessage type="info" {...props} />
);

export const SuccessMessage = (props) => (
  <ValidationMessage type="success" {...props} />
);

// Form validation summary component
export const ValidationSummary = ({
  errors = [],
  title = "Please correct the following errors:",
  ...props
}) => {
  if (!errors || errors.length === 0) return null;

  return (
    <ValidationMessage
      type="error"
      variant="alert"
      title={title}
      messages={errors}
      {...props}
    />
  );
};

export default ValidationMessage; 