import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ProfileHeader from '../components/ProfileHeader';
import ProfileTabs from '../components/ProfileTabs';
import UserPosts from '../components/UserPosts';
import { userService } from '../services/api';

const Profile = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const userData = await userService.getMyProfile(username);
        setUser(userData.user);
        setPosts(userData.posts || []);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user profile', {
          style: {
            background: '#1F2937',
            color: '#FFF',
          },
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  const handleEditPost = async (formData, postId) => {
    try {
      const updatedPost = await userService.updatePost(postId, formData);
      setPosts(posts.map(post => 
        post._id === postId ? updatedPost : post
      ));
      toast.success('Post updated successfully', {
        style: {
          background: '#1F2937',
          color: '#FFF',
        },
      });
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post', {
        style: {
          background: '#1F2937',
          color: '#FFF',
        },
      });
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await userService.deletePost(postId);
      setPosts(posts.filter(post => post._id !== postId));
      toast.success('Post deleted successfully', {
        style: {
          background: '#1F2937',
          color: '#FFF',
        },
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post', {
        style: {
          background: '#1F2937',
          color: '#FFF',
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-400">User not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <ProfileHeader user={user} />
        
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="mt-8">
          {activeTab === 'posts' && (
            <UserPosts
              posts={posts}
              onEditPost={handleEditPost}
              onDeletePost={handleDeletePost}
              isLoading={isLoading}
            />
          )}
          
          {activeTab === 'about' && (
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
              <h3 className="text-lg font-medium text-white mb-4">About</h3>
              <p className="text-gray-300">
                {user.bio || 'No bio available'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 