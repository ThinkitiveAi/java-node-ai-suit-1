import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Backdrop,
  Paper,
  LinearProgress
} from '@mui/material';
import { keyframes } from '@mui/system';

// Custom heartbeat animation for healthcare theme
const heartbeat = keyframes`
  0% {
    transform: scale(1);
  }
  14% {
    transform: scale(1.3);
  }
  28% {
    transform: scale(1);
  }
  42% {
    transform: scale(1.3);
  }
  70% {
    transform: scale(1);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const LoadingSpinner = ({
  size = 'medium', // 'small', 'medium', 'large', 'xlarge'
  variant = 'circular', // 'circular', 'linear', 'dots', 'heartbeat'
  color = 'primary',
  message = '',
  overlay = false,
  backdrop = false,
  fullScreen = false,
  centered = true,
  thickness = 4,
  sx = {},
  messageProps = {},
  ...props
}) => {
  // Size mappings
  const getSizeValue = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'medium':
        return 40;
      case 'large':
        return 60;
      case 'xlarge':
        return 80;
      default:
        return typeof size === 'number' ? size : 40;
    }
  };

  const sizeValue = getSizeValue();

  // Render different spinner variants
  const renderCircularSpinner = () => (
    <CircularProgress
      size={sizeValue}
      thickness={thickness}
      color={color}
      sx={sx}
      {...props}
    />
  );

  const renderLinearSpinner = () => (
    <Box sx={{ width: '100%', ...sx }}>
      <LinearProgress color={color} {...props} />
    </Box>
  );

  const renderDotsSpinner = () => (
    <Box
      sx={{
        display: 'flex',
        gap: 0.5,
        alignItems: 'center',
        ...sx
      }}
    >
      {[0, 1, 2].map((index) => (
        <Box
          key={index}
          sx={{
            width: sizeValue / 4,
            height: sizeValue / 4,
            borderRadius: '50%',
            bgcolor: `${color}.main`,
            animation: `${pulse} 1.4s ease-in-out ${index * 0.16}s infinite both`,
          }}
        />
      ))}
    </Box>
  );

  const renderHeartbeatSpinner = () => (
    <Box
      sx={{
        width: sizeValue,
        height: sizeValue,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx
      }}
    >
      <Box
        sx={{
          width: '70%',
          height: '70%',
          bgcolor: 'primary.main',
          clipPath: 'polygon(50% 0%, 83% 12%, 100% 43%, 94% 78%, 68% 100%, 50% 85%, 32% 100%, 6% 78%, 0% 43%, 17% 12%)',
          animation: `${heartbeat} 1.2s ease-in-out infinite`,
        }}
      />
    </Box>
  );

  const renderSpinner = () => {
    switch (variant) {
      case 'linear':
        return renderLinearSpinner();
      case 'dots':
        return renderDotsSpinner();
      case 'heartbeat':
        return renderHeartbeatSpinner();
      case 'circular':
      default:
        return renderCircularSpinner();
    }
  };

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        ...(centered && !overlay && !backdrop && {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }),
      }}
    >
      {renderSpinner()}
      {message && (
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{
            maxWidth: 200,
            ...messageProps.sx,
          }}
          {...messageProps}
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  // Render with backdrop (full screen overlay)
  if (backdrop || fullScreen) {
    return (
      <Backdrop
        open={true}
        sx={{
          zIndex: (theme) => theme.zIndex.modal + 1,
          color: '#fff',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {content}
      </Backdrop>
    );
  }

  // Render with overlay (relative to parent)
  if (overlay) {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 1,
          borderRadius: 'inherit',
        }}
      >
        {content}
      </Box>
    );
  }

  // Render inline spinner
  return content;
};

// Specialized loading components
export const PageLoader = ({ message = 'Loading...', ...props }) => (
  <LoadingSpinner
    size="large"
    message={message}
    centered
    {...props}
  />
);

export const ButtonLoader = ({ size = 'small', ...props }) => (
  <LoadingSpinner
    size={size}
    variant="circular"
    {...props}
  />
);

export const FormLoader = ({ message = 'Processing...', ...props }) => (
  <LoadingSpinner
    size="medium"
    message={message}
    overlay
    {...props}
  />
);

export const CardLoader = ({ message, ...props }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 200,
      p: 3,
    }}
  >
    <LoadingSpinner
      size="medium"
      message={message}
      {...props}
    />
  </Box>
);

export const InlineLoader = ({ size = 'small', ...props }) => (
  <LoadingSpinner
    size={size}
    centered={false}
    sx={{ display: 'inline-flex' }}
    {...props}
  />
);

// Healthcare-themed loader
export const HealthcareLoader = ({ message = 'Connecting to healthcare services...', ...props }) => (
  <LoadingSpinner
    variant="heartbeat"
    size="large"
    message={message}
    color="primary"
    {...props}
  />
);

// Loading skeleton for form fields
export const FieldSkeleton = ({ width = '100%', height = 56 }) => (
  <Paper
    elevation={0}
    sx={{
      width,
      height,
      bgcolor: 'grey.100',
      borderRadius: 1,
      position: 'relative',
      overflow: 'hidden',
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
        animation: `${pulse} 1.5s ease-in-out 0.5s infinite`,
      },
    }}
  />
);

export default LoadingSpinner; 