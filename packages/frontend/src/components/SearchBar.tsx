import { useState } from 'react';

interface SearchBarProps {
  onSearch: (text: string, tags: string[]) => void;
  availableTags: string[];
}

export default function SearchBar({ onSearch, availableTags }: SearchBarProps) {
  const [searchText, setSearchText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  const handleSearch = () => {
    onSearch(searchText, selectedTags);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search deals by title, description, or vendor..."
          className="input input-bordered flex-1"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn btn-primary" onClick={handleSearch}>
          Search
        </button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm font-medium">Tags:</span>
        {selectedTags.map((tag) => (
          <span key={tag} className="badge badge-primary gap-2">
            {tag}
            <button onClick={() => toggleTag(tag)}>×</button>
          </span>
        ))}
        <div className="dropdown">
          <label
            tabIndex={0}
            className="btn btn-sm btn-outline"
            onClick={() => setShowTagDropdown(!showTagDropdown)}
          >
            + Add Tag
          </label>
          {showTagDropdown && (
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 max-h-60 overflow-y-auto"
            >
              {availableTags.map((tag) => (
                <li key={tag}>
                  <a onClick={() => toggleTag(tag)}>
                    {selectedTags.includes(tag) && '✓ '}
                    {tag}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
