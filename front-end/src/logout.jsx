import React from 'react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

export default function Logout() {
  const navigation = useNavigate()
  useEffect(() => {
    if (localStorage.getItem("admin#token") === null) {
      navigation("/")
    }
  }, [navigation]);

  useEffect(() => {
    localStorage.clear()
  }, []);
  return (
    <div>

    </div>
  )
}
