import React, { useState } from 'react'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import axios from "axios"
import {axiosWithAuth} from "../axios"
import PrivateRoute from './PRoute'


import Articles from './Articles'
import LoginForm from './LoginForm'
import Message from './Message'
import ArticleForm from './ArticleForm'
import Spinner from './Spinner'

const articlesUrl = 'http://localhost:9000/api/articles'
const loginUrl = 'http://localhost:9000/api/login'

export default function App() {
  const [message, setMessage] = useState('')
  const [articles, setArticles] = useState([])
  const [currentArticleId, setCurrentArticleId] = useState(null)
  const [spinnerOn, setSpinnerOn] = useState(false)

  const navigate = useNavigate()
  const redirectToLogin = () => { navigate('/') }
  const redirectToArticles = () => { navigate('/articles') }

  const logout = () => {
    // ✨ implement
    // If a token is in local storage it should be removed,
    // and a message saying "Goodbye!" should be set in its proper state.
    // In any case, we should redirect the browser back to the login screen,
    // using the helper above.
    if(localStorage.getItem("token")){
      localStorage.removeItem("token")
    }
    setMessage("Goodbye!");
    redirectToLogin();
  }

  const login = (values) => {
    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch a request to the proper endpoint.
    // On success, we should set the token to local storage in a 'token' key,
    // put the server success message in its proper state, and redirect
    // to the Articles screen. Don't forget to turn off the spinner!
    setSpinnerOn(true);
    axios.post(loginUrl, values)
      .then(res => {
        // console.log(res.data)
        localStorage.setItem('token', res.data.token);
        setMessage(res.data.message);
        redirectToArticles();
        setSpinnerOn(false);
      })
      .catch( err => {
        console.error("Error, whoops!", err)
      })
  }

  const getArticles = () => {
    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch an authenticated request to the proper endpoint.
    // On success, we should set the articles in their proper state and
    // put the server success message in its proper state.
    // If something goes wrong, check the status of the response:
    // if it's a 401 the token might have gone bad, and we should redirect to login.
    // Don't forget to turn off the spinner!
    setSpinnerOn(true);
    setMessage("");
    axiosWithAuth().get(articlesUrl)
      .then(res => {
        // console.log(res.data);
        setArticles(res.data.articles);
        setMessage(res.data.message);
        setSpinnerOn(false);
      })
      .catch(err => {
        (error => console.error("Error token gone bad!", error));
        setMessage('');
        setSpinnerOn(false);
      })

  }

  const postArticle = (values) => {
    // ✨ implement
    // The flow is very similar to the `getArticles` function.
    // You'll know what to do! Use log statements or breakpoints
    // to inspect the response from the server.
    setSpinnerOn(true);
    setMessage("");
    axiosWithAuth().post(articlesUrl, values)
      .then(res => {
        // console.log(res.data);
        setMessage(res.data.message);
        setSpinnerOn(false);
        setArticles([...articles, res.data.article])
      })
      .catch(err => {
        console.error("Error token gone bad!", err);
        setMessage('');
        setSpinnerOn(false);
      })
  }

  const updateArticle = (values) => {
    // ✨ implement
    // You got this!
    setSpinnerOn(true);
    setMessage("");
    axiosWithAuth().put(`${articlesUrl}/${values.article_id}`, values)
      .then(res => {
        // console.log(res.data);
        setMessage(res.data.message);
        setSpinnerOn(false);
        const updatedArticle = articles.map(a => {
          if(a.article_id === values.article_id)
          return {
            ...a,
            title: values.title,
            text: values.text,
            topic: values.topic
          };
          return a;
        });
        setArticles(updatedArticle);
      })
      .catch(err => {
        setMessage("");
        console.error("Error token gone bad!", err);
        setSpinnerOn(false);
      })
  }

  const deleteArticle = (article_id) => {
    // ✨ implement
    // setSpinnerOn(true);
    setMessage("");
    axiosWithAuth().delete(`${articlesUrl}/${article_id}`)
      .then(res => {
        setMessage(res.data.message);
        setSpinnerOn(false);
        const articlesToStore = articles.filter(a => a.article_id !== article_id)
        setArticles(articlesToStore);
      })
      .catch(err => {
        setMessage("");
        console.error("Error token gone bad!", err);
        setSpinnerOn(false);
      })
  }

  return (
    // ✨ fix the JSX: `Spinner`, `Message`, `LoginForm`, `ArticleForm` and `Articles` expect props ❗
    <>
      <Spinner on={spinnerOn}/>
      <Message message={message}/>
      <button id="logout" onClick={logout}>Logout from app</button>
      <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}> {/* <-- do not change this line */}
        <h1>Advanced Web Applications</h1>
        <nav>
          <NavLink id="loginScreen" to="/">Login</NavLink>
          <NavLink id="articlesScreen" to="/articles">Articles</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm login={login}/>} />
          <Route path="articles" element={
            <PrivateRoute>
              <ArticleForm 
                postArticle={postArticle}
                updateArticle={updateArticle}
                articles={articles}
                currentArticleId={currentArticleId}
                setCurrentArticleId={setCurrentArticleId}
              />
              <Articles 
                articles={articles}
                setSpinnerOn={setSpinnerOn}
                currentArticleId={currentArticleId}
                setCurrentArticleId={setCurrentArticleId}
                getArticles={getArticles}
                deleteArticle={deleteArticle}
              />
            </PrivateRoute>
          } />
        </Routes>
        <footer>Bloom Institute of Technology 2022</footer>
      </div>
    </>
  )
}