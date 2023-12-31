import { fetchUser, fetchUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Image from 'next/image';
import UserCard from "@/components/cards/UserCard";



async function Page () {

// Checks the user currently exists
const user = await currentUser();
if (!user) return null;

// Checks if user was correctly onboarded
const userInfo = await fetchUser(user.id);
if (!userInfo?.onboarded) redirect('/onboarding');

// Fetches all users
const result = await fetchUsers ({
    userId: user.id,
    searchString: '',
    pageNumber: 1,
    pageSize: 25,
})



  return (
    <section>
        <h1 className="head-text mb-10">
            Search
        </h1>
        <div className="mt-14 flex flex-col gap-9">
            {result.users.length === 0 ? (
                <p className="no-result">
                    No users
                </p>
            ) : (
                <>
                    {result.users.map((person) => (
                        <UserCard
                        key={person.id}
                        id={person.id}
                        name={person.name}
                        username={person.username}
                        imgUrl={person.image}
                        personType='User'
                        />
                    ))}
                </>
            )}
        </div>
    </section>
  )
}

export default Page