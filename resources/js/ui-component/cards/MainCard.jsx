// material-ui
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { useTheme, alpha } from '@mui/material/styles';

// constant
const headerStyle = {
  '& .MuiCardHeader-action': { mr: 0 }
};

const MainCard = function MainCard({
  border = false,
  boxShadow,
  children,
  content = true,
  contentClass = '',
  contentSX = {},
  headerSX = {},
  darkTitle,
  secondary,
  shadow,
  sx = {},
  title,
  ref,
  ...others
}) {
  const theme = useTheme();
  const defaultShadow = '0 4px 20px 0 rgb(0 0 0 / 8%)';

  return (
    <Card
      ref={ref}
      {...others}
      sx={{
        border: border ? '1px solid' : 'none',
        borderColor: 'divider',
        borderRadius: 3,
        background: 'linear-gradient(145deg, #ffffff 0%, #fafafa 100%)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        ':hover': {
          boxShadow: boxShadow ? shadow || defaultShadow : '0 4px 16px rgba(0, 0, 0, 0.08)',
          transition: 'box-shadow 0.2s ease-in-out'
        },
        ...sx
      }}
    >
      {/* card header and action */}
      {!darkTitle && title && <CardHeader sx={{ ...headerStyle, ...headerSX }} title={title} action={secondary} />}
      {darkTitle && title && (
        <CardHeader sx={{ ...headerStyle, ...headerSX }} title={<Typography variant="h3">{title}</Typography>} action={secondary} />
      )}

      {/* content & header divider */}
      {title && (
        <Divider 
          sx={{ 
            borderColor: alpha(theme.palette.primary.main, 0.1),
            borderWidth: 1
          }} 
        />
      )}

      {/* card content */}
      {content && (
        <CardContent sx={contentSX} className={contentClass}>
          {children}
        </CardContent>
      )}
      {!content && children}
    </Card>
  );
};

export default MainCard;
