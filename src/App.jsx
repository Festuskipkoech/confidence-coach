import React from 'react'
import './App.css'
import ConfidenceCoach from './confidence.jsx'
import { Analytics } from '@vercel/analytics/react';


function App() {

  return (
    <>
    <ConfidenceCoach/>
    <Analytics/>
    </>
  )
}

export default App
