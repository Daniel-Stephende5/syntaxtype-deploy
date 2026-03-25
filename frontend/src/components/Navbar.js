import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuthToken, setAuthToken, subscribeToAuthChanges } from '../utils/AuthUtils'; // Import subscribeToAuthChanges
import { getUserRole } from '../utils/JwtUtils';

// Material-UI Imports
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    useMediaQuery,
    useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import DashboardIcon from '@mui/icons-material/Dashboard';

const Navbar = () => {
    const navigate = useNavigate();
    // Initialize isLoggedIn state based on current token status
    const [isLoggedIn, setIsLoggedIn] = useState(!!getAuthToken());
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleNavigation = (path) => {
        setSidebarOpen(false);
        navigate(path);
    }

    const sidebarList = [
        { text: "Typing Test", link: "/typingtest" },
        { text: "Bookworm", link: "/bookworm" },
       
        { text: "Galaxy New", link: "/galaxy-new"},
        { text: "Quiz", link: "/quiz" },
        { text: "Grid Game", link: "/grid" },
       
        { text: "Leaderboard", link: "/leaderboard" },
        // { text: "Instructor Module", link: "/instructor" },
        { text: "Challenges", link: "/challenges" },
        // { text: "Create Lesson", link: "/lesson" },
    ]

    const RenderSidebar = (
        <Box>
            <List sx={{
                gap: '15px', width: '250px', backgroundColor: '#2c3e50',
                
            }}>
                {sidebarList.map((item, index) => (
                    <ListItem key={index} disablePadding>
                        <ListItemButton onClick={() => handleNavigation(item.link)} sx={{
                            '&:hover': {
                            backgroundColor: '#1abc9c',
                            padding: '5px',
                            borderRadius: '4px'
                            }
                        }}>
                            <ListItemText primary={item.text} sx={{color:'white'}} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    )

    
    // Effect to update login status when token changes (via custom event)
    useEffect(() => {
        // Subscribe to custom auth change events from AuthUtils
        const unsubscribe = subscribeToAuthChanges((loggedInStatus) => {
            setIsLoggedIn(loggedInStatus);
        });

        // Initial check on mount (important for first render)
        setIsLoggedIn(!!getAuthToken());

        // Cleanup subscription on unmount
        return () => {
            unsubscribe(); // Unsubscribe from the custom event to prevent memory leaks
        };
    }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount.

    const handleLogout = () => {
        setAuthToken(null); // This will dispatch the custom event via AuthUtils
        navigate('/login'); // Redirect to login page
    };

    const toggleSidebar = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setSidebarOpen(open);
    };

    return (
        <>
            <AppBar position="fixed" sx={{ backgroundColor: '#1f2937' }}>
                <Toolbar>
                {isLoggedIn ? (
                        <>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                            onClick={toggleSidebar(true)}
                        >
                            <MenuIcon />
                        </IconButton>

                        <Drawer
                            anchor="left"
                            open={sidebarOpen}
                            onClose={toggleSidebar(false)}
                            sx={{'& .MuiDrawer-paper': {backgroundColor: '#2c3e50'}}}
                        >
                            {RenderSidebar}
                        </Drawer>
                        </>
                    ) : null}


                    <Typography
                        variant="h6"
                        component={Link}
                        to={isLoggedIn ? "/dashboard" : "/login"}
                        sx={{
                            flexGrow: 1,
                            textDecoration: 'none',
                            color: 'inherit',
                            fontWeight: 'bold',
                            fontFamily: 'Inter, sans-serif',
                        }}
                    >
                        SyntaxType
                    </Typography>

                    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                        {!isLoggedIn ? (
                            <>
                                <Button
                                    color="inherit"
                                    component={Link}
                                    to="/login"
                                    startIcon={<LoginIcon />}
                                    sx={{ textTransform: 'none', borderRadius: '0.375rem' }}
                                >
                                    Login
                                </Button>
                                <Button
                                    color="inherit"
                                    component={Link}
                                    to="/register"
                                    startIcon={<AppRegistrationIcon />}
                                    sx={{ textTransform: 'none', borderRadius: '0.375rem', ml: 1 }}
                                >
                                    Register
                                </Button>
                            </>
                        ) : (
                            <Button
                                color="inherit"
                                onClick={handleLogout}
                                startIcon={<LogoutIcon />}
                                sx={{ textTransform: 'none', borderRadius: '0.375rem' }}
                            >
                                Logout
                            </Button>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>
            <Toolbar />

            
        </>
    );
};

export default Navbar;
