const avatars = [
  "breed1",
  "breed2",
  "breed3",
  "breed4",
  "breed5",
  "breed6",
  "breed7",
  "breed8",
];


function randomAvatar() {
  return avatars[Math.floor(Math.random() * avatars.length)];
}


const avatarsEl = document.getElementById("avatars");

avatars.forEach(function (avatar) {
  avatarsEl.insertAdjacentHTML(
    "beforeend",
    "<img id='" + avatar + "' class='avatar' src='./images/" + avatar + ".jpg'>"
  );
});


const avatarElements = document.querySelectorAll(".avatar");

let selectedAvatar;

avatarElements.forEach(function (avatarElement) {
  avatarElement.addEventListener("click", function (event) {
    selectedAvatar = event.target.id;
 
    const elems = document.querySelectorAll('.avatar');

    elems.forEach(function(el) {
      el.classList.remove('selected');
    });

    document.getElementById(selectedAvatar).classList.add("selected");
  });
});


let userName;

document.getElementById("join-button").addEventListener("click", function () {
  userName = document.getElementById("user-name").value;

  if (!selectedAvatar) {
    selectedAvatar = randomAvatar();
  }

  if (userName && userName.length > 2) {
    document.getElementById("chat-body").style.display = "block";
    document.getElementById("join-view").style.display = "none";

    const CLIENT_ID = "9S4qOXbeXC1DoFRm";

    const drone = new ScaleDrone(CLIENT_ID, {
      data: {
        name: userName,
        
        avatar: selectedAvatar,
      },
    });


    let members = [];

    drone.on("open", (error) => {
      if (error) {
        return console.error(error);
      }
      
      const room = drone.subscribe("observable-room");
      room.on("open", (error) => {
        if (error) {
          return console.error(error);
        }
    
      });

      room.on("members", (m) => {
        members = m;
        updateMembersDOM();
      });

      room.on("member_join", (member) => {
        console.log("Member: ", member);
        members.push(member);
        updateMembersDOM();
      });

      room.on("member_leave", ({ id }) => {
        const index = members.findIndex((member) => member.id === id);
        members.splice(index, 1);
        updateMembersDOM();
      });

      room.on("data", (text, member) => {
        if (member) {
          addMsgInHtml(text, member);
        } 
      });
    });

  


    const DOM = {
      membersNumber: document.querySelector(".members-count"),
      membersList: document.querySelector(".members-list"),
      allMsgs: document.querySelector(".message-container"),
      memberMsgContainer: document.querySelector(".members-msg-container"),
      inputMessages: document.querySelector(".msg-input"),
      form: document.querySelector(".msg-form"),
    };

    DOM.form.addEventListener("submit", sendMessage);

    function sendMessage() {
      const value = DOM.inputMessages.value;
      if (value === "") {
        return;
      }
      DOM.inputMessages.value = "";
      drone.publish({
        room: "observable-room",
        message: value,
      });
    }


    document.getElementById("exit-button").addEventListener("click", function() {
      location.reload();

      document.getElementById("chat-body").style.visibility = "hidden";
      document.getElementById("members-list").style.visibility = "hidden";
      document.getElementById("join-view").style.display = "block";
    });

    function newMember(member) {
      const { name, avatar } = member.clientData;
      const el = document.createElement("div");
      el.innerHTML =
        "<img src='./images/" + avatar + ".jpg' class='avatar'>" + name;
      el.className = "member";
     
      return el;
    }

    function updateMembersDOM() {
      DOM.membersNumber.innerText = `${members.length} users online`;
      DOM.membersList.innerHTML = "";
      members.forEach((member) =>
        DOM.membersList.appendChild(newMember(member))
      );
    }

    function newMessage(text, member) {
      const { name, } = member.clientData;

      const parentEl = document.createElement("div");
      parentEl.className = "col-12 message-parent";

      const el = document.createElement("div");
      el.appendChild(newMember(member));
      el.appendChild(document.createTextNode(text));

      if (name === userName) {
        el.className = "message";
      } else {
        el.className = "message-right";
      }

      parentEl.appendChild(el);
      
      return parentEl;
    }

    function addMsgInHtml(text, member) {
      const el = DOM.allMsgs;
      el.appendChild(newMessage(text, member));

      const memberMsgContainerEl = DOM.memberMsgContainer;
      memberMsgContainerEl.scrollTop = memberMsgContainerEl.scrollHeight - memberMsgContainerEl.clientHeight;
    }
  }
});
