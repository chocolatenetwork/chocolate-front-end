// Styles are temporarily back
import 'semantic-ui-css/semantic.min.css';
import { AppLayout } from './Layouts/app/AppLayout';
import { AppProvider } from './Layouts/app/AppProvider';
// released the brakes on styles

export default function App(): JSX.Element {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}
