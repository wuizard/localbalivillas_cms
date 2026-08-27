import { useRoutes } from 'react-router-dom';

// project import
import LoginRoutes from './LoginRoutes';
import LBVRoutes from './LBVRoutes';

// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
  return useRoutes([LBVRoutes, LoginRoutes]);
}
