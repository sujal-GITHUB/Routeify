import { useRef, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setRideData } from "../../actions/rideActions";
import { setUserData } from "../../actions/userActions"; // Add this import
import axios from "axios";
import logo from "../../assets/logo1.png";
import initialState from "../../reducers/userReducer"; // Add this import
import gsap from "gsap";
import "remixicon/fonts/remixicon.css";
import PickupSearchPanel from "../../components/User/PickupLocationPanel";
import DestinationSearchPanel from "../../components/User/DestinationLocationPanel";
import car from "../../assets/car.png";
import bike from "../../assets/bike.png";
import auto from "../../assets/auto.png";
import VehiclePanel from "../../components/User/VehiclePanel";
import FindCaptains from "../../components/User/FindCaptains";
import { socketContext } from "../../context/socketContext";
import { fetchUserData } from "../../actions/userActions";
import Map from "../Map";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Keep UI states local
  const [panelOpen, setPanelOpen] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [showRideOptions, setShowRideOptions] = useState(false);
  const [showFindCaptains, setShowFindCaptains] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [selectedRide, setSelectedRide] = useState(null);
  const [input, setInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);
  const [up, setUp] = useState(false);

  // Update selectors to handle undefined state
  const rideData = useSelector((state) => state.ride) || {};
  const { pickup = "", destination = "", price = "", rideId } = rideData;

  const user = useSelector((state) => state.user);
  const { socket } = useContext(socketContext);

  const panelRef = useRef(null);
  const mainPanel = useRef(null);
  const panelClose = useRef(null);
  const panelDown = useRef(null);
  const panelMove = useRef(null);
  const findCaptainsRef = useRef(null);
  const vehiclePanelRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchUserData());
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Handle error appropriately (e.g., redirect to login)
        navigate("/login");
      } finally {
        setLoadingUser(false);
      }
    };
    fetchData();
  }, [dispatch, navigate]);

  useEffect(() => {
    if (!loadingUser && user && user.id) {
      if (!socket) return;

      if (!socket.hasJoined) {
        socket.emit("join", {
          userType: "user",
          userId: user.id,
          userData: {
            name: user.name,
            email: user.email,
            phone: user.phone,
          },
        });
        socket.hasJoined = true;
      }
    }
  }, [user, socket, loadingUser]);

  useEffect(() => {
    if (pickup && destination) {
      const tl = gsap.timeline({
        defaults: {
          ease: "power3.inOut",
          duration: 0.3,
        },
      });

      // First slide the panel down
      tl.to(panelRef.current, {
        height: "0%",
        opacity: 0,
        y: 50, // Add slide down effect
        duration: 0.3,
      })
        .call(() => {
          setPanelOpen(false);
        })
        // Add 1 second delay
        .delay(1)
        // Then show vehicle panel with slide up animation
        .call(() => {
          setShowRideOptions(true);
        })
        .fromTo(
          vehiclePanelRef.current,
          {
            opacity: 0,
            height: 0,
            y: 20,
          },
          {
            opacity: 1,
            height: "auto",
            y: 0,
            duration: 0.5,
            clearProps: "all",
          }
        )
        .to(panelRef.current, {
          clearProps: "transform",
        });
    }
  }, [pickup, destination]);

  // Panel animation with proper null checks
  useEffect(() => {
    if (!panelRef.current) return;

    const panel = panelRef.current;
    const tl = gsap.timeline({
      defaults: {
        ease: "power3.out",
        duration: 0.2,
      },
    });

    if (panelOpen) {
      tl.set(panel, { display: "block", opacity: 0 }).to(panel, {
        height: "75%",
        opacity: 1,
        transformOrigin: "top center",
      });
    } else {
      tl.to(panel, {
        height: "0%",
        opacity: 0,
      }).set(panel, { display: "none" });
    }

    return () => {
      tl.kill();
    };
  }, [panelOpen]);

  useEffect(() => {
    if (selectedRide) {
      const tl = gsap.timeline();

      // Hide form first
      tl.to(formRef.current, {
        opacity: 0,
        height: 0,
        duration: 0.3,
      })
        // Then hide vehicle panel and show find captains
        .to(vehiclePanelRef.current, {
          opacity: 0,
          height: 0,
          duration: 0.3,
          onComplete: () => {
            setShowForm(false);
            setShowFindCaptains(true);
            gsap.fromTo(
              findCaptainsRef.current,
              { opacity: 0, height: 0 },
              { opacity: 1, height: "auto", duration: 0.5 }
            );
          },
        });
    }
  }, [selectedRide]);

  const handleInputFocus = (inputType) => {
    setPanelOpen(true);
    setActivePanel(inputType);
  };

  const handleLocationSelect = (location, type) => {
    dispatch(
      setRideData({
        [type === "pickup" ? "pickup" : "destination"]: location,
      })
    );
  };

  const handleDestinationSelect = (location) => {
    dispatch(setRideData({ destination: location }));
    setDestinationInput(location);
  };

  // Reset to initial state
  const resetToInitialState = () => {
    const tl = gsap.timeline({
      defaults: {
        ease: "power3.out",
        duration: 0.3,
      },
    });

    // First animate the panel height smoothly
    tl.to(panelRef.current, {
      height: "0%",
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        setPanelOpen(false);
        setActivePanel(null);
      },
    })
      // Then animate other panels with stagger
      .to([findCaptainsRef.current, vehiclePanelRef.current], {
        opacity: 0,
        height: 0,
        duration: 0.3,
        stagger: 0.2,
        onComplete: () => {
          setShowRideOptions(false);
          setSelectedRide(null);
          dispatch(
            setRideData({ pickup: "", destination: "", selectedRide: "" })
          );
          setShowFindCaptains(false);
          setShowForm(true);
        },
      })
      // Finally set display none
      .set(panelRef.current, {
        display: "none",
      });

    // Fade in the form after panel closes
    tl.fromTo(
      formRef.current,
      { opacity: 0, height: 0 },
      { opacity: 1, height: "auto", duration: 0.3 }
    );
  };

  const handleCancelRide = () => {
    const tl = gsap.timeline({
      defaults: {
        ease: "power3.inOut",
        duration: 0.3
      }
    });

    tl.to(findCaptainsRef.current, {
      opacity: 0,
      height: 0,
      y: 20,
      duration: 0.3
    })
    .to(vehiclePanelRef.current, {
      opacity: 0,
      height: 0,
      duration: 0.3,
      onComplete: () => {
        setShowFindCaptains(false);
        setShowRideOptions(false);
        setSelectedRide(null);
        setPanelOpen(false);
        setActivePanel(null);
        setUp(false);

        socket.emit("cancel-ride", { userId: user.id, rideId: rideId });


        setInput("");
        setDestinationInput("");

        dispatch(setRideData({ 
          pickup: "", 
          destination: "", 
          selectedRide: "",
          price: "",
          distance: "",
          time: "",
          rideId: "",
        }));

        setShowForm(true);
      }
    })
    // Finally show the form
    .fromTo(formRef.current,
      { 
        opacity: 0, 
        height: 0 
      },
      { 
        opacity: 1, 
        height: "auto", 
        duration: 0.3,
        clearProps: "all"
      }
    );
  };

  const handleInputClick = () => {
    const tl = gsap.timeline();

    tl.to(vehiclePanelRef.current, {
      opacity: 0,
      height: 0,
      duration: 0.3,
      onComplete: () => setShowRideOptions(false),
    });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!pickup || !destination || !selectedRide) {
      alert("Please select both locations and a ride type.");
      return;
    }
    console.log("Booking:", { pickup, destination, selectedRide, price });
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("usertoken");
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/users/logout`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        // Clear localStorage
        localStorage.removeItem("usertoken");

        // Reset Redux states
        dispatch(setUserData(initialState));
        dispatch(
          setRideData({
            pickup: "",
            destination: "",
            selectedRide: "",
            price: "",
          })
        );

        // Reset local states
        setPanelOpen(false);
        setActivePanel(null);
        setShowRideOptions(false);
        setShowFindCaptains(false);
        setShowForm(true);
        setSelectedRide(null);
        setInput("");
        setDestinationInput("");
        setUp(false);

        // Navigate to login
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const rides = [
    {
      id: "car",
      name: "Car",
      image: car,
      capacity: 4,
      waitTime: "2 mins",
      description: "Affordable, comfortable ride",
      price: "₹19.20",
    },
    {
      id: "motorcycle",
      name: "Motorcycle",
      image: bike,
      capacity: 2,
      waitTime: "2 mins",
      description: "Quick, efficient ride",
      price: "₹10.25",
    },
    {
      id: "auto",
      name: "Auto",
      image: auto,
      capacity: 4,
      waitTime: "5 mins",
      description: "Economic, traditional ride",
      price: "₹15.20",
    },
  ];

  const handlePanelUpState = () => {
    setPanelOpen(true);
    setActivePanel("pickup");
    setShowRideOptions(false);
    const tl = gsap.timeline();

    tl.to(vehiclePanelRef.current, {
      opacity: 0,
      height: 0,
      duration: 0.3,
    }).to(panelRef.current, {
      height: "auto",
      opacity: 1,
      duration: 0.3,
    });
  };

  const handleVehiclePanelToggle = () => {
    const tl = gsap.timeline({
      defaults: {
        ease: "power3.inOut",
        duration: 0.3,
      },
    });

    if (!up) {
      // Panel going down
      tl.to(vehiclePanelRef.current, {
        opacity: 0,
        height: 0,
        y: -20,
        duration: 0.3,
      });
      setUp((prev) => !prev);
    } else {
      // Panel going up
      tl.to(vehiclePanelRef.current, {
        opacity: 1,
        height: "auto",
        y: 0,
        duration: 0.3,
        clearProps: "all",
      });
      setUp((prev) => !prev);
    }
  };

  const handleFindCaptainsPanelToggle = () => {
    const tl = gsap.timeline({
      defaults: {
        ease: "power3.inOut",
        duration: 0.3
      }
    });
  
    if (!up) {
      tl.to(findCaptainsRef.current, {
        opacity: 0,
        height: 0,
        y: 50,
        duration: 0.4,
        onComplete: () => {
          setUp(true);
        }
      })
    } else {
      tl.to(findCaptainsRef.current, {
        opacity: 1,
        height: "auto",
        y: 0,
        duration: 0.3,
        clearProps: "all",
        onComplete: () => {
          setUp(false);
        }
      });
    }
  };

  return (
    // Update the root div className to prevent scrolling
    <div className="h-screen font-lexend relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Map />
      </div>

      <div className="p-5">
        <img src={logo} alt="Routeify Logo" className="w-20" />
      </div>

      {/* Update the main panel div to handle overflow properly */}
      <div
        ref={mainPanel}
        className="absolute w-full inset-0 flex flex-col md:px-20 justify-end overflow-hidden"
      >
        <div className="bg-white p-5 rounded-t-2xl">
          <div className="flex justify-between items-center mb-5">
            <h4 className="font-semibold">Book your ride</h4>
            <div className="flex items-center gap-2">
              <button onClick={logout} className="text-red-500">
                <i className="ri-logout-box-line text-xl" />
              </button>
              {showRideOptions ? (
                showFindCaptains ? (
                  <button
                    ref={panelMove}
                    onClick={handleFindCaptainsPanelToggle}
                    className="opacity-1"
                  >
                    <i
                      className={`ri-arrow-${up ? "up" : "down"}-s-line text-xl`}
                    />
                  </button>
                ) :
                (<button
                  ref={panelDown}
                  onClick={handleVehiclePanelToggle}
                  className="opacity-1"
                >
                  <i
                    className={`ri-arrow-${up ? "up" : "down"}-s-line text-xl`}
                  />
                </button>)
              ) :  (
                <button
                  ref={panelClose}
                  onClick={panelOpen ? resetToInitialState : handlePanelUpState}
                  className="opacity-1"
                >
                  <i
                    className={`ri-arrow-${
                      panelOpen ? "down" : "up"
                    }-s-line text-xl`}
                  />
                </button>
              )}
            </div>
          </div>

          {/* Update the form container to handle overflow */}
          <div
            ref={formRef}
            style={{
              opacity: showForm ? 1 : 0,
              height: showForm ? "auto" : 0,
              overflow: "hidden",
              maxHeight: "calc(100vh - 200px)" // Add max height
            }}
          >
            <form onSubmit={submitHandler} className="space-y-3">
              <div className="relative px-1">
                <div className="relative">
                  <div className="absolute h-[45px] w-0.5 top-[55px] left-5 -translate-y-1/2 bg-gray-900 rounded-full">
                    <span className="absolute top-[-10px] left-[-4px] w-2.5 h-2.5 bg-gray-900 rounded-full"></span>
                    <span className="absolute bottom-[-10px] left-[-4px] w-2.5 h-2.5 bg-gray-900 rounded-full"></span>
                  </div>
                </div>
                <input
                  value={activePanel === "pickup" ? input : pickup}
                  onChange={(e) => {
                    if (activePanel === "pickup") {
                      setInput(e.target.value);
                    } else {
                      handleLocationSelect(e.target.value, "pickup");
                    }
                  }}
                  onFocus={() => {
                    handleInputFocus("pickup");
                    setInput(pickup); // Sync the local input with the current pickup value
                  }}
                  onClick={handleInputClick}
                  type="text"
                  placeholder="Enter your pickup location"
                  className={`w-full bg-gray-100 pl-10 p-3 mt-1 rounded-xl text-base transition-all ${
                    activePanel === "pickup" ? "ring-2 ring-black" : ""
                  }`}
                />

                <input
                  value={
                    activePanel === "destination"
                      ? destinationInput
                      : destination
                  }
                  onChange={(e) => {
                    if (activePanel === "destination") {
                      setDestinationInput(e.target.value);
                    } else {
                      handleLocationSelect(e.target.value, "destination");
                    }
                  }}
                  onFocus={() => {
                    handleInputFocus("destination");
                    setDestinationInput(destination); // Sync local destination input.
                  }}
                  onClick={handleInputClick}
                  type="text"
                  placeholder="Enter your destination"
                  className={`w-full bg-gray-100 pl-10 p-3 mb-1 rounded-xl text-base mt-3 transition-all ${
                    activePanel === "destination" ? "ring-2 ring-black" : ""
                  }`}
                />
              </div>
            </form>
          </div>

          <div
            ref={vehiclePanelRef}
            style={{
              opacity: showRideOptions && !showFindCaptains ? 1 : 0,
              height: showRideOptions && !showFindCaptains ? "auto" : 0,
              overflow: "hidden",
            }}
          >
            {showRideOptions && !showFindCaptains && (
              <VehiclePanel rides={rides} setSelectedRide={setSelectedRide} />
            )}
          </div>

          <div
            ref={findCaptainsRef}
            style={{
              opacity: showFindCaptains ? 1 : 0,
              height: showFindCaptains ? "auto" : 0,
              overflow: "hidden",
            }}
          >
            {showFindCaptains && (
              <FindCaptains
                handleCancelRide={handleCancelRide}
              />
            )}
          </div>
        </div>

        {/* Update the search panel div to handle its own scrolling */}
        <div
          ref={panelRef}
          className="bg-gray-100  transition-all overflow-y-auto"
          style={{ 
            height: "0%", 
            display: "none",
            maxHeight: "75vh" // Add max height constraint
          }}
        >
          {activePanel === "pickup" && (
            <PickupSearchPanel
              input={input}
              setInput={setInput}
              setPickup={(loc) => handleLocationSelect(loc, "pickup")}
            />
          )}
          {activePanel === "destination" && (
            <DestinationSearchPanel
              destination={destinationInput}
              setDestination={(loc) => handleDestinationSelect(loc)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
