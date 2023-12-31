import { Link } from 'react-router-dom'
import { useEffect, useState, useContext } from "react";
import { UserContext } from "../../App"
import M from 'materialize-css';

function Home() {
  const [data, setData] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const { state, dispatch } = useContext(UserContext);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://mern-social-network-gamma.vercel.app/allpost", {
          headers: {
            "Authorization": "Bearer " + localStorage.getItem("jwt"),
          },
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const result = await response.json();
        setData(result.posts);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);



  const likePost = async (id) => {
    try {
      const response = await fetch('https://mern-social-network-gamma.vercel.app/like', {
        method: "put",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("jwt")
        },
        body: JSON.stringify({
          postId: id
        })
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      const newData = data.map(item => {
        if (item._id == result._id) {
          return result;
        } else {
          return item;
        }
      });
      setData(newData);
    } catch (err) {
      console.error('Error liking post:', err);
    }
  }




  const unlikePost = async (id) => {
    try {
      const response = await fetch("https://mern-social-network-gamma.vercel.app/unlike", {
        method: "put",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
        body: JSON.stringify({
          postId: id,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      const newData = data.map((item) => {
        if (item._id === result._id) {
          return result;
        } else {
          return item;
        }
      });

      setData(newData);
    } catch (err) {
      console.error(err);
    }
  };




  const makeComment = (text, postId) => {
    fetch('https://mern-social-network-gamma.vercel.app/comment', {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("jwt")
      },
      body: JSON.stringify({
        postId,
        text
      })
    }).then(res => res.json())
      .then(result => {
        const newData = data.map(item => {
          if (item._id == result._id) {
            return result
          } else {
            return item
          }
        })
        setData(newData)
      }).catch(err => {
        console.log(err)
      })
  }


  const deletePost = (postid) => {
    fetch(`https://mern-social-network-gamma.vercel.app/deletepost/${postid}`, {
      method: "delete",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then(data => {
        if (data.message) {
          M.toast({ html: data.message, classes: "#b71c1c red darken-4" })
        }
      })
      .then((result) => {
        const newData = data.filter(item => {
          return item._id !== result._id
        })
        setData(newData)
      });
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };



  return (
    <>
      <div className="home">
        {data.map((item) => {
          return (
            <div className="card home-card" key={item._id}>
              <h5>
                <Link to={item.postedBy._id !== state._id ? "/profile/" + item.postedBy._id :  "/profile"}>
                  {item.postedBy.name}
                </Link>
                {item.postedBy._id === state._id && <i className="material-icons" style={{ float: "right" }} onClick={() => {
                  deletePost(item._id)
                }}>delete</i>}

              </h5>
              <div className="card-image">
                <img
                  src={item.photo} alt="post-pic"
                />
              </div>
              <div className="card-content">
                {item.likes.includes(state._id) ? (<i className="material-icons" onClick={() => { unlikePost(item._id); }}>thumb_down</i>)
                  : (<i className="material-icons" onClick={() => { likePost(item._id) }}>thumb_up</i>)}

                <h6>{item.likes.length} likes</h6>
                <h6>{item.title}</h6>
                <p>{item.body}</p>
                {item.comments.map((record) => {
                  return (
                    <h6 key={record._id}>
                      <span style={{ fontWeight: "500" }}>
                        {record.postedBy.name}
                      </span>
                      <span style={{ marginLeft: "5px" }}>{record.text}</span>
                    </h6>
                  );
                })}
                <form onSubmit={(e) => {
                  e.preventDefault();
                  makeComment(e.target[0].value, item._id);
                }}>
                  <input type="text" placeholder="add a comment" />
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default Home;


// 53:16