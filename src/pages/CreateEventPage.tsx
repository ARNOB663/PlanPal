import React from 'react';
import Layout from '../components/layout/Layout';
import EventForm from '../components/forms/EventForm';

const CreateEventPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <EventForm />
      </div>
    </Layout>
  );
};

export default CreateEventPage;