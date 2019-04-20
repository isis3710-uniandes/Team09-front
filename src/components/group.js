import React from 'react';
import '../css/group.css';
import UserProfile from "./UserProfile";
import User from "./user";
import ReactDOM from "react-dom";
import Whiteboard from "./whiteboard";
import Room from "./room";

const axios = require('axios');

export default class Group extends React.Component {
	constructor(props){
		super(props);
		console.log(" ID RECIEVED IS "+ this.props.groupid);
		this.state={
			"groupID":16,
			"name":'Not working',
			"users":[],
			"rooms":[]
		}
		this.handleUserAddition =this.handleUserAddition.bind(this);
		this.handleRoomAddition = this.handleRoomAddition.bind(this);
	}

	componentWillMount(){
		var o;
		axios.get(`http://localhost:3001/api/groups/${this.props.groupid}`).then(function(response){
			o = response.data;
			console.log(o);
		}).catch((err)=>{
			console.log(err);
		}).then(()=>{
			var s ={
				"groupID":o.id,
				"name":o.name,
				"users":[],
				"rooms":[]
			}
			this.setState(s);
			console.log(this.state);

			var consulta
		axios.get('/api/groups/'+ this.state.groupID+'/users').then(function(response){
			console.log(response.data);
			consulta=response.data;
	    }).catch(function(error){
	      console.log(error);
	    }).then(()=>{
	    	this.setState({users:consulta});
				console.log(this.state.users);
				var list = document.getElementById("listOfUsers");
            for (var i =0;i< consulta.length; i++){
                console.log(consulta[i]);
                var li = document.createElement("li");
                var text = document.createTextNode(consulta[i].username);
                li.appendChild(text);
                list.appendChild(li);
            }
	    });

	    var consulta1;
		axios.get('/api/groups/'+ this.state.groupID+'/rooms').then(function(response){
			console.log(response.data);
			consulta1=response.data;
	    }).catch(function(error){
	      console.log(error);
	    }).then(()=>{
	    	this.setState({rooms:consulta1});
				console.log(this.state.rooms);
				var list = document.getElementById("listOfRooms");
            for (var i =0;i< consulta1.length; i++){
                console.log(consulta1[i]);
                var li = document.createElement("li");
                var a = document.createElement('a');
                a.appendChild(document.createTextNode(consulta1[i].name));
								a.setAttribute("className", "groupNames")
								a.href="#";
                a.setAttribute("id", `room-${consulta1[i].roomId}`);
                a.onclick = this.handleRoomGo.bind(consulta1[i].roomId);
                li.appendChild(a);
                list.appendChild(li);
            }
			});
		});
	}
	componentDidMount(){
		var modal = document.getElementById('modalAddUser');
		var modalRooms=document.getElementById('modalRooms');

    document.getElementsByClassName("closeOverlay")[0].onclick = function() {
      modal.style.display = "none";
		}
		document.getElementsByClassName("closeOverlay")[1].onclick=function(){
			modalRooms.style.display="none";
		}
  
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
    	if (event.target == modal) {
     		modal.style.display = "none";
			}
			else if (event.target ==modalRooms){
				modalRooms.style.display="none";
			}
    }
	}

	handleRoomGo(event){
		var id = event.srcElement.id.split('-')[1];
    ReactDOM.render(<Room roomId={id}/>, document.getElementById("root"))
  }

	logOut(){
		window.location.reload();
	}

	goToDrawing(){
		ReactDOM.render(<Whiteboard />, document.getElementById("root"));
	}

	goToUser(){
		ReactDOM.render(<User />, document.getElementById("root"));
	}

	handleAdditionOverlay(event){
			event.preventDefault();
			var modal = document.getElementById('modalAddUser');
			modal.style.display = "block";
	}

	handleRoomOverlay(event){
		event.preventDefault();
			var modal = document.getElementById('modalRooms');
			modal.style.display = "block";
	}

	handleUserAddition(event){
		let that = this;
		event.preventDefault();
		var userId=-1;
		var username = document.getElementById("uName").value;
		var isAdmin = document.getElementById("isAdmin").checked;
		axios.get('http://localhost:3001/api/users/name/'+username).then(function(response){
			userId=response.data[0].userID;
			console.log(userId);
		}).catch(function(err){
			console.log(err);
		}).then(()=>{
			if(isAdmin){
				axios.post('http://localhost:3001/api/groups/admins', {
					"groupId": that.state.groupID, 
					"userId": userId
				}).then(()=>{
					var list = document.getElementById("listOfUsers");
					var li = document.createElement("li");
					li.appendChild(document.createTextNode(username));
					list.appendChild(li);
				}).catch(function(err){
					console.log(err);
				});
			}
			else{
				axios.post('http://localhost:3001/api/groups/users', {
				"groupId": that.state.groupID, 
				"userId": userId
			}).then(()=>{
				var list = document.getElementById("listOfUsers");
				var li = document.createElement("li");
				li.appendChild(document.createTextNode(username));
				list.appendChild(li);
			}).catch(function(err){
				console.log(err);
			});
			}
		});
	}

	handleRoomAddition(event){
		let that = this;
		event.preventDefault();
		var roomname = document.getElementById("roomname").value;
		axios.post('http://localhost:3001/api/rooms/create', {
					"groupId": that.state.groupID, 
					"name": roomname
		}).then((response)=>{
			var list = document.getElementById("listOfRooms");
			var lastID = response.data[1].lastID;
			var li = document.createElement("li");
			var a = document.createElement('a');
			a.appendChild(document.createTextNode(roomname));
			a.setAttribute("className", "groupNames")
			a.href="#";
			a.setAttribute("id", `room-${lastID}`);
			a.onclick = this.handleRoomGo.bind(lastID);
			li.appendChild(a);
			list.appendChild(li);
		}).catch(function(err){
				console.log(err);
		});
	}

	render(){
		var style = {
      			overflow: 'scroll',
      			height: '400px'
    		};
		return(
			<div>
				<div id="container">
					<div id="left">
					<h2 id="groupName">{this.state.name}</h2>
				    	<div className="lists" style={style}>
							<ul id="listOfUsers">
                                    
							</ul>
				    	</div>
							<button class="addUser" onClick={this.handleAdditionOverlay}>Add User</button>
							<div id="modalAddUser" class="modal">
              	<div class="modal-content-pic">
                  <span class="closeOverlay">&times;</span>
                  <form onSubmit={this.handleUserAddition}>
                    Insert username of the user to add:<br/>
                    <input id="uName" type="text" name="usern"/><br/>
										Will the user be an admin?<input id="isAdmin" type="checkbox" name="adminP" value="adminP"/><br/>
                    <input type="submit" value="Submit"/>
                  </form>
                </div>
              </div>
				    </div>
				    <div id="right">
				    <h2>Rooms</h2>
				    	<div className="lists" style={style}>
				    		<ul id="listOfRooms">
                                    
							</ul>
				    	</div>
							<button class="addRoom" onClick={this.handleRoomOverlay}>Create a New Room</button>
							<div id="modalRooms" class="modal">
                <div class="modal-content-pic">
                  <span class="closeOverlay">&times;</span>
                  <form onSubmit={this.handleRoomAddition}>
                    Insert room name:<br/>
                    <input type="text" name="roomname" id="roomname"/><br/>
                    <input type="submit" value="Submit"/>
                  </form>
                </div>
              </div>
				    </div>
				</div>
				<nav class="navbar navbar-expand-sm bg-dark"> 
             <ul class="navbar-nav">
               <li class="nav-item">
                  <a class="nav-link" href="#">LogicDrawing</a>
                </li>
                <li class="nav-item">
                	<a class="nav-link" href="#" onClick={this.goToDrawing}>Canvas</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#" onClick={this.goToUser}>{UserProfile.getName()}</a>
               	</li>
                <li class="nav-item">
                   <a class="nav-link" href="#" onClick={this.logOut}>Log Out</a>
                </li>
          	</ul>
        </nav>
			</div>
		);
	}
}